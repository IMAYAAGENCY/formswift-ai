import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

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

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment verification parameters');
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

    // Decrypt secret for signature verification
    const webhookSecret = await decryptCredential(config.webhook_secret);

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const hmac = createHmac('sha256', webhookSecret);
    hmac.update(text);
    const generated_signature = hmac.digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (isValid) {
      // Update payment status in database
      await supabaseClient
        .from('form_payments')
        .update({ 
          status: 'succeeded',
          payment_id: razorpay_payment_id,
        })
        .eq('payment_id', razorpay_order_id);
    }

    return new Response(
      JSON.stringify({ 
        verified: isValid,
        payment_id: razorpay_payment_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in razorpay-verify-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});