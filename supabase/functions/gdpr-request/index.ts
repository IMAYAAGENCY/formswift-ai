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
    const { requestType } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log(`Processing GDPR request: ${requestType}`);

    if (requestType === 'export') {
      // Collect all user data
      const userData: any = {
        profile: null,
        forms: null,
        payments: null,
        logs: null,
        affiliateData: null,
      };

      const [profile, forms, payments, logs, affiliateData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('forms').select('*').eq('user_id', user.id),
        supabase.from('payments').select('*').eq('user_id', user.id),
        supabase.from('logs').select('*').eq('user_id', user.id),
        supabase.from('affiliate_links').select('*').eq('user_id', user.id),
      ]);

      userData.profile = profile.data;
      userData.forms = forms.data;
      userData.payments = payments.data;
      userData.logs = logs.data;
      userData.affiliateData = affiliateData.data;

      // Create GDPR request record
      const { data: request, error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          request_type: 'export',
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: 'GDPR_EXPORT_REQUESTED',
        p_resource_type: 'user_data',
        p_details: { request_id: request.id }
      });

      return new Response(
        JSON.stringify({ data: userData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (requestType === 'delete') {
      // Create deletion request (actual deletion requires admin approval)
      const { data: request, error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          request_type: 'delete',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: 'GDPR_DELETE_REQUESTED',
        p_resource_type: 'user_data',
        p_details: { request_id: request.id }
      });

      return new Response(
        JSON.stringify({ 
          message: 'Deletion request created. Your account will be deleted within 30 days.',
          requestId: request.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid request type');

  } catch (error) {
    console.error('GDPR request error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});