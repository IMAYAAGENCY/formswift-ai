import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { amount, currency = 'usd', description, formId } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Get user's Stripe configuration
    const { data: config, error: configError } = await supabaseClient
      .from('payment_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('Stripe integration not configured');
    }

    // Create Stripe payment intent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.webhook_secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount * 100)), // Convert to cents
        currency: currency.toLowerCase(),
        description: description || 'Form payment',
        'metadata[user_id]': user.id,
        'metadata[form_id]': formId || '',
      }).toString(),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      console.error('Stripe API error:', error);
      throw new Error(error.error?.message || 'Failed to create payment');
    }

    const paymentIntent = await stripeResponse.json();

    // Log payment in database
    await supabaseClient
      .from('form_payments')
      .insert({
        form_id: formId,
        payment_provider: 'stripe',
        payment_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
        status: paymentIntent.status,
        payment_integration_id: config.id,
      });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in stripe-create-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});