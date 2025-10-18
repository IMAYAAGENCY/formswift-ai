import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error message mapping for security
const ERROR_MESSAGES: Record<string, string> = {
  'PGRST116': 'The requested resource was not found',
  'PGRST301': 'You do not have permission to access this resource',
  '23505': 'This operation would create a duplicate entry',
  'default': 'An error occurred while processing your request. Please try again later.'
};

// Input validation schema
const formDataSchema = z.object({
  formData: z.object({
    fileName: z.string().min(1).max(255),
    fileType: z.enum(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']),
    fileSize: z.number().positive().max(10485760), // 10MB max
  }).optional(),
});

function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Log full error server-side for debugging
    console.error('Internal error:', error);
    
    // Return safe message to client
    const pgCode = (error as any).code;
    return ERROR_MESSAGES[pgCode] || ERROR_MESSAGES.default;
  }
  return ERROR_MESSAGES.default;
}

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

    // Check time-based rate limiting (max 5 requests per minute)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentLogs, error: logsError } = await supabase
      .from('logs')
      .select('timestamp')
      .eq('user_id', user.id)
      .eq('action', 'form_upload')
      .gte('timestamp', oneMinuteAgo);

    if (logsError) {
      console.error('Error checking rate limit:', logsError);
    }

    if (recentLogs && recentLogs.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before uploading another form.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check form limit from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('used_forms, form_limit, plan_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.used_forms >= profile.form_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Form limit reached. Please upgrade your plan to continue.',
          used: profile.used_forms,
          limit: profile.form_limit
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = formDataSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data. Please check your input and try again.',
          details: validation.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { formData } = validation.data;

    // Log the action
    await supabase.from('logs').insert({
      user_id: user.id,
      action: 'form_upload'
    });

    // Increment used_forms counter
    await supabase
      .from('profiles')
      .update({ used_forms: profile.used_forms + 1 })
      .eq('id', user.id);

    // Process form (placeholder for actual AI processing)
    // TODO: Add actual form processing logic here

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
            event: 'form_uploaded',
            timestamp: new Date().toISOString(),
            user_id: user.id,
            form_data: formData,
          }),
        });
        console.log('n8n webhook triggered for form upload');
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Form uploaded successfully',
        remaining_forms: profile.form_limit - profile.used_forms - 1
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: getSafeErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
