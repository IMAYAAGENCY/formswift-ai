import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planName,
      amount 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Missing payment details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_SECRET) {
      console.error('Razorpay secret not configured');
      return new Response(
        JSON.stringify({ error: 'Payment verification system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Plan configurations for updating user profile
    const PLAN_CONFIGS: Record<string, { forms: number; duration_days: number }> = {
      'Per Form': { forms: 1, duration_days: 0 },
      'Daily': { forms: 10, duration_days: 1 },
      'Weekly': { forms: 100, duration_days: 7 },
      'Monthly': { forms: 400, duration_days: 30 },
      'Quarterly': { forms: 1500, duration_days: 90 },
      'Yearly': { forms: 10000, duration_days: 365 },
    };

    const planConfig = PLAN_CONFIGS[planName];
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiry date
    const expiryDate = planConfig.duration_days > 0
      ? new Date(Date.now() + planConfig.duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan_type: planName,
        form_limit: planConfig.forms,
        used_forms: 0, // Reset used forms on upgrade
        expiry_date: expiryDate,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    // Record payment in payments table
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        payment_id: razorpay_payment_id,
        plan: planName,
        amount: amount / 100, // Convert paise to rupees
        payment_status: 'success',
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
    }

    // Log the upgrade action
    await supabase.from('logs').insert({
      user_id: user.id,
      action: 'plan_upgrade',
    });

    console.log('Payment verified and profile updated for user:', user.id);

    // Handle referral conversions and rewards
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('referred_by, referral_conversions, free_plans_earned')
      .eq('id', user.id)
      .single();

    if (referrerProfile?.referred_by) {
      // Find the referrer
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, referral_code')
        .eq('referral_code', referrerProfile.referred_by)
        .single();

      if (referrer) {
        // Check for affiliate commission (10%)
        const { data: affiliateLink } = await supabase
          .from('affiliate_links')
          .select('*')
          .eq('user_id', referrer.id)
          .eq('referral_code', referrerProfile.referred_by)
          .single();

        const commissionAmount = affiliateLink?.is_affiliate 
          ? (amount / 100) * (affiliateLink.commission_rate / 100)
          : 0;

        // Record the conversion
        await supabase.from('referral_conversions').insert({
          referrer_user_id: referrer.id,
          referred_user_id: user.id,
          referral_code: referrerProfile.referred_by,
          payment_id: razorpay_payment_id,
          payment_amount: amount / 100,
          commission_amount: commissionAmount,
          status: 'completed',
          credited_at: new Date().toISOString(),
        });

        // Update referrer's conversion count
        const newConversionCount = (referrerProfile.referral_conversions || 0) + 1;
        
        // Check if they've reached 3 conversions for a free plan
        const shouldAwardFreePlan = newConversionCount % 3 === 0;
        
        await supabase
          .from('profiles')
          .update({
            referral_conversions: newConversionCount,
            ...(shouldAwardFreePlan && {
              free_plans_earned: (referrerProfile.free_plans_earned || 0) + 1,
              form_limit: planConfig.forms, // Award the same plan
              plan_type: `${planName} (Free Referral Reward)`,
              expiry_date: new Date(Date.now() + planConfig.duration_days * 24 * 60 * 60 * 1000).toISOString(),
            })
          })
          .eq('id', referrer.id);

        // Update affiliate link stats if applicable
        if (affiliateLink) {
          await supabase
            .from('affiliate_links')
            .update({
              total_conversions: (affiliateLink.total_conversions || 0) + 1,
              total_earnings: (affiliateLink.total_earnings || 0) + commissionAmount,
            })
            .eq('id', affiliateLink.id);
        }

        console.log(`Referral conversion tracked for referrer ${referrer.id}`);
        if (shouldAwardFreePlan) {
          console.log(`Free plan awarded to referrer ${referrer.id} after 3 conversions`);
        }
      }
    }

    // Trigger n8n webhook if configured
    const { data: webhookData } = await supabase
      .from('profiles')
      .select('n8n_webhook_url')
      .eq('id', user.id)
      .single();

    if (webhookData?.n8n_webhook_url) {
      try {
        await fetch(webhookData.n8n_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment_verified',
            timestamp: new Date().toISOString(),
            user_id: user.id,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            amount: amount / 100,
            plan: planName,
          }),
        });
        console.log('n8n webhook triggered for payment verification');
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment successful and plan upgraded',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while verifying the payment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
