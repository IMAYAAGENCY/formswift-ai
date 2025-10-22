import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Decrypt payment credentials
const decryptCredential = async (encryptedText: string): Promise<string> => {
  const encryptionKey = Deno.env.get('PAYMENT_ENCRYPTION_KEY') || '';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(encryptionKey.padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
};

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

    const { planId, totalCount, quantity = 1, customerNotify = 1, notes } = await req.json();

    if (!planId) {
      throw new Error('Plan ID is required');
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

    // Decrypt credentials
    const apiKey = await decryptCredential(config.api_key_encrypted);
    const apiSecret = await decryptCredential(config.webhook_secret);

    // Create Razorpay subscription
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: totalCount,
        quantity: quantity,
        customer_notify: customerNotify,
        notes: notes || {
          user_id: user.id,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.json();
      console.error('Razorpay API error:', error);
      throw new Error(error.error?.description || 'Failed to create Razorpay subscription');
    }

    const subscription = await razorpayResponse.json();

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        planId: subscription.plan_id,
        keyId: apiKey, // Return decrypted key for client
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in razorpay-create-subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});