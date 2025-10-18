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

    // Download the form file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('uploaded-forms')
      .download(form.file_link);

    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download form file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = fileData.type || 'image/jpeg';
    const base64Image = `data:${mimeType};base64,${base64}`;

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
            content: `You are an expert form filling assistant. Analyze the form image and fill it out with realistic sample data.
            
            IMPORTANT INSTRUCTIONS:
            1. Identify ALL empty fields in the form
            2. Fill each field with appropriate, realistic sample data
            3. Use proper formatting for each field type (dates, phone numbers, addresses, etc.)
            4. For personal information fields, use realistic example names, addresses, etc.
            5. Return the filled data as a clear, structured JSON object with field names as keys
            
            Example output format:
            {
              "Student's Name": "John Michael Smith",
              "Father's Name": "Robert Smith",
              "Mother's Name": "Sarah Smith",
              "Birth Date": "15/03/2005",
              "Gender": "Male",
              "Religion": "Christian",
              "Nationality": "American",
              "Phone Number": "+1-555-0123",
              "Email Address": "john.smith@email.com",
              ...and so on for all fields
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this form (${form.form_name}) and fill out ALL empty fields with appropriate sample data. Return a complete JSON object with all field names and their filled values.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
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
            event: 'form_ai_processed',
            timestamp: new Date().toISOString(),
            user_id: user.id,
            form_id: formId,
            form_name: form.form_name,
            analysis: analysisResult,
          }),
        });
        console.log('n8n webhook triggered for AI processing');
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Form processed successfully',
        analysis: analysisResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Error in ai-process-form:', error);
    
    // Return sanitized error message to client
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your form. Please try again later.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
