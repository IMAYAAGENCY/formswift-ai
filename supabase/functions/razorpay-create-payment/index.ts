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

    const { amount, currency = 'INR', description, formId, receipt } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Get user's Razorpay configuration
    const { data: config, error: configError } = await supabaseClient
      .from('payment_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'razorpay')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('Razorpay integration not configured');
    }

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.api_key_encrypted}:${config.webhook_secret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          user_id: user.id,
          form_id: formId || '',
          description: description || 'Form payment',
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.json();
      console.error('Razorpay API error:', error);
      throw new Error(error.error?.description || 'Failed to create Razorpay order');
    }

    const order = await razorpayResponse.json();

    // Log payment in database
    await supabaseClient
      .from('form_payments')
      .insert({
        form_id: formId,
        payment_provider: 'razorpay',
        payment_id: order.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: order.status,
        payment_integration_id: config.id,
      });

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.api_key_encrypted, // Return key ID for client-side Razorpay checkout
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in razorpay-create-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});