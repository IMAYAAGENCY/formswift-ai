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
    const { audioData, formFields } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice input...');

    // First, transcribe the audio using Gemini's audio capabilities
    const transcriptionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: [
              {
                type: 'text',
                text: 'Transcribe this audio and extract structured data that matches these form fields. Return a JSON object with field names as keys and extracted values.'
              },
              {
                type: 'audio_url',
                audio_url: {
                  url: audioData
                }
              }
            ]
          }
        ]
      }),
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`AI gateway error: ${transcriptionResponse.status}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcription = transcriptionData.choices?.[0]?.message?.content || '';

    // Now extract structured data
    const extractionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `From this transcription: "${transcription}", extract data for these form fields: ${JSON.stringify(formFields)}. Return a JSON object with field names as keys and extracted values. Only return valid JSON.`
          }
        ]
      }),
    });

    if (!extractionResponse.ok) {
      throw new Error(`AI gateway error: ${extractionResponse.status}`);
    }

    const extractionData = await extractionResponse.json();
    let extractedFields = extractionData.choices?.[0]?.message?.content || '{}';

    // Extract JSON from markdown if present
    const jsonMatch = extractedFields.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      extractedFields = jsonMatch[1];
    }

    const parsedFields = JSON.parse(extractedFields);

    console.log('Voice processing complete');

    return new Response(
      JSON.stringify({ 
        transcription,
        extractedFields: parsedFields
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing voice:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});