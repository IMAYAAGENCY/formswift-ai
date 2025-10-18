import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as OTPAuth from "https://esm.sh/otpauth@9.2.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (action === 'setup') {
      // Generate secret and QR code
      const secret = new OTPAuth.Secret({ size: 20 });
      const totp = new OTPAuth.TOTP({
        issuer: 'FormAI Vault',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Store in database (not yet enabled)
      const { error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: user.id,
          secret: secret.base32,
          backup_codes: backupCodes,
          enabled: false
        });

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: '2FA_SETUP_INITIATED',
        p_resource_type: 'authentication',
        p_details: { email: user.email }
      });

      return new Response(
        JSON.stringify({
          secret: secret.base32,
          qrCode: totp.toString(),
          backupCodes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      // Get stored secret
      const { data: twoFactorData } = await supabase
        .from('two_factor_auth')
        .select('secret')
        .eq('user_id', user.id)
        .single();

      if (!twoFactorData) throw new Error('2FA not set up');

      // Verify token
      const secret = OTPAuth.Secret.fromBase32(twoFactorData.secret);
      const totp = new OTPAuth.TOTP({
        issuer: 'FormAI Vault',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      const delta = totp.validate({ token, window: 1 });

      if (delta === null) {
        throw new Error('Invalid token');
      }

      // Enable 2FA
      await supabase
        .from('two_factor_auth')
        .update({
          enabled: true,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: '2FA_ENABLED',
        p_resource_type: 'authentication',
        p_details: { email: user.email }
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disable') {
      await supabase
        .from('two_factor_auth')
        .delete()
        .eq('user_id', user.id);

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: '2FA_DISABLED',
        p_resource_type: 'authentication',
        p_details: { email: user.email }
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('2FA error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});