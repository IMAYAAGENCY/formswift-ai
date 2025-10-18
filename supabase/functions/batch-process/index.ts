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
    const { formIds, jobName } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create batch job
    const { data: job, error: jobError } = await supabase
      .from('batch_jobs')
      .insert({
        user_id: user.id,
        job_name: jobName,
        total_forms: formIds.length,
        status: 'processing'
      })
      .select()
      .single();

    if (jobError) throw jobError;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Starting batch processing job: ${jobName}`);

    // Process forms in parallel
    const results = await Promise.allSettled(
      formIds.map(async (formId: string) => {
        try {
          const { data: form } = await supabase
            .from('forms')
            .select('*')
            .eq('id', formId)
            .single();

          if (!form) throw new Error('Form not found');

          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'user',
                  content: `Analyze and fill this form: ${form.form_name}. Extract all fields and suggest appropriate values based on common patterns.`
                }
              ]
            }),
          });

          if (!response.ok) {
            throw new Error(`AI gateway error: ${response.status}`);
          }

          const data = await response.json();
          const analysis = data.choices?.[0]?.message?.content || '';

          // Update form with analysis
          await supabase
            .from('forms')
            .update({ ai_filled_link: analysis })
            .eq('id', formId);

          return { formId, success: true };
        } catch (error) {
          return { formId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedCount = results.length - successCount;

    // Update job status
    await supabase
      .from('batch_jobs')
      .update({
        processed_forms: successCount,
        failed_forms: failedCount,
        status: 'completed',
        completed_at: new Date().toISOString(),
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Processing failed' })
      })
      .eq('id', job.id);

    console.log(`Batch job completed: ${successCount} succeeded, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        jobId: job.id,
        processed: successCount,
        failed: failedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch processing:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});