import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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

    const { formId, formData } = await req.json();

    // Get user ID from the auth token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Processing form:', formId, 'for user:', user.id);

    // Store the processed form data
    const { data, error } = await supabaseClient
      .from('forms')
      .update({ ai_filled_link: JSON.stringify(formData) })
      .eq('id', formId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Trigger webhooks if configured
    const { data: webhooks } = await supabaseClient
      .from('custom_webhooks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .contains('events', ['form.processed']);

    if (webhooks && webhooks.length > 0) {
      for (const webhook of webhooks) {
        try {
          const webhookResponse = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': webhook.secret_key || '',
            },
            body: JSON.stringify({
              event: 'form.processed',
              formId,
              formData,
              timestamp: new Date().toISOString(),
            }),
          });

          // Log webhook call
          await supabaseClient
            .from('webhook_logs')
            .insert({
              webhook_id: webhook.id,
              event_type: 'form.processed',
              payload: { formId, formData },
              response_status: webhookResponse.status,
              response_body: await webhookResponse.text(),
              success: webhookResponse.ok,
            });

          console.log('Webhook triggered:', webhook.name, 'Status:', webhookResponse.status);
        } catch (webhookError) {
          console.error('Webhook error:', webhook.name, webhookError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-form function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});