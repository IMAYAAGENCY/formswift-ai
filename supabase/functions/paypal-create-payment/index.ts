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

    const { amount, currency = 'USD', description, formId } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Get user's PayPal configuration
    const { data: config, error: configError } = await supabaseClient
      .from('payment_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'paypal')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('PayPal integration not configured');
    }

    const baseUrl = config.test_mode
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    // Get PayPal access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.api_key_encrypted}:${config.webhook_secret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with PayPal');
    }

    const { access_token } = await authResponse.json();

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          description: description || 'Form payment',
        }],
        application_context: {
          return_url: `${req.headers.get('origin')}/payment-success`,
          cancel_url: `${req.headers.get('origin')}/payment-cancel`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('PayPal API error:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();

    // Log payment in database
    await supabaseClient
      .from('form_payments')
      .insert({
        form_id: formId,
        payment_provider: 'paypal',
        payment_id: order.id,
        amount,
        currency: currency.toUpperCase(),
        status: order.status,
        payment_integration_id: config.id,
      });

    return new Response(
      JSON.stringify({
        orderId: order.id,
        approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in paypal-create-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});