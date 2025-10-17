import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

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

    // Rate limiting: Check for recent AI processing requests
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentProcessing } = await supabase
      .from('logs')
      .select('timestamp')
      .eq('user_id', user.id)
      .eq('action', 'form_processed')
      .gte('timestamp', oneMinuteAgo);

    if (recentProcessing && recentProcessing.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 3 AI processing requests per minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { formId } = await req.json();

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'Form ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing form:', formId);

    // Fetch form data
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single();

    if (formError || !form) {
      return new Response(
        JSON.stringify({ error: 'Form not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI to analyze the form
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert form processor. Analyze the uploaded form and extract all fields, data, and structure. 
            Return a structured summary including:
            - Form type (e.g., application, tax form, survey)
            - All field names and their current values
            - Any instructions or notes
            - Suggestions for filling out empty fields
            
            Format your response as clear, organized JSON.`
          },
          {
            role: 'user',
            content: `Analyze this form: ${form.form_name}. File location: ${form.file_link}. 
            Extract all visible fields and provide insights on how to complete it.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI processing failed');
    }

    const aiData = await aiResponse.json();
    const analysisResult = aiData.choices?.[0]?.message?.content || 'No analysis available';

    console.log('AI Analysis completed');

    // Store the AI analysis result
    const { error: updateError } = await supabase
      .from('forms')
      .update({ 
        ai_filled_link: analysisResult 
      })
      .eq('id', formId);

    if (updateError) {
      console.error('Error updating form:', updateError);
      throw updateError;
    }

    // Log the processing action
    await supabase.from('logs').insert({
      user_id: user.id,
      action: 'form_processed'
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Form processed successfully',
        analysis: analysisResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-process-form:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred while processing the form'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
