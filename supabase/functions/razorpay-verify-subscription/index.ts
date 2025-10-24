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
      razorpay_subscription_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan_name,
      amount,
      currency = 'INR'
    } = await req.json();

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
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

    // Verify signature for subscription
    const text = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const hmac = createHmac('sha256', webhookSecret);
    hmac.update(text);
    const generated_signature = hmac.digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Calculate subscription dates based on plan
    const now = new Date();
    let expiresAt = new Date(now);
    let allowedForms = 100;

    switch (plan_name?.toLowerCase()) {
      case 'weekly':
        expiresAt.setDate(now.getDate() + 7);
        allowedForms = 50;
        break;
      case 'monthly':
        expiresAt.setMonth(now.getMonth() + 1);
        allowedForms = 100;
        break;
      case 'quarterly':
        expiresAt.setMonth(now.getMonth() + 3);
        allowedForms = 300;
        break;
      case 'yearly':
        expiresAt.setFullYear(now.getFullYear() + 1);
        allowedForms = 1200;
        break;
      default:
        expiresAt.setMonth(now.getMonth() + 1);
        allowedForms = 100;
    }

    // Update user profile with subscription details
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_plan: plan_name || 'Monthly',
        subscription_status: 'active',
        allowed_forms: allowedForms,
        plan_expires_at: expiresAt.toISOString(),
        razorpay_subscription_id: razorpay_subscription_id,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to update subscription status');
    }

    // Log the payment
    await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount || 0,
        currency: currency,
        status: 'succeeded',
        payment_provider: 'razorpay',
        subscription_id: razorpay_subscription_id,
        payment_id: razorpay_payment_id,
      });

    // Log audit event
    await supabaseClient.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'subscription_activated',
      p_resource_type: 'subscription',
      p_details: {
        plan: plan_name,
        subscription_id: razorpay_subscription_id,
        payment_id: razorpay_payment_id,
        expires_at: expiresAt.toISOString(),
      },
    });

    console.log('Subscription verified and activated:', {
      user_id: user.id,
      subscription_id: razorpay_subscription_id,
      plan: plan_name,
    });

    return new Response(
      JSON.stringify({ 
        verified: true,
        subscription_id: razorpay_subscription_id,
        payment_id: razorpay_payment_id,
        expires_at: expiresAt.toISOString(),
        allowed_forms: allowedForms,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in razorpay-verify-subscription:', error);
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
