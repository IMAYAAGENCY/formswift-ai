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
    const { imageData, userData } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

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

    console.log('Step 1: Extracting text and detecting fields from form...');

    // Step 1: OCR + Field Detection
    const ocrResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                text: `Analyze this form image and extract:
1. All visible text content
2. Detect all form fields (labels like "Name:", "Email:", "Phone:", "Address:", "DOB:", "Gender:", etc.)
3. For each field, identify: label, field type (text/email/phone/date/select), and position

Return a JSON object with this structure:
{
  "full_text": "complete extracted text",
  "fields": [
    {"label": "Name", "type": "text", "required": true},
    {"label": "Email", "type": "email", "required": true}
  ]
}

Be precise and match exact labels from the form.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ]
      }),
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error('OCR error:', errorText);
      throw new Error(`OCR failed: ${ocrResponse.status}`);
    }

    const ocrData = await ocrResponse.json();
    let ocrResult = ocrData.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON from markdown if present
    const jsonMatch = ocrResult.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      ocrResult = jsonMatch[1];
    }

    const formStructure = JSON.parse(ocrResult);

    console.log('Step 2: Auto-filling form with user data...');

    // Step 2: Auto-fill with AI
    const fillPrompt = `
You are a form auto-fill assistant. Fill this form accurately.

Form structure: ${JSON.stringify(formStructure.fields)}
Form content: ${formStructure.full_text}

User's data: ${JSON.stringify(userData)}

Instructions:
1. Match user data to form fields precisely
2. Use exact label names from the form
3. Format data appropriately (dates as DD/MM/YYYY for Indian forms, phone with country code if needed)
4. If data is missing, use "N/A" as placeholder
5. Ensure 100% field completion

Return ONLY a JSON object:
{
  "filled_fields": {
    "Name": "value",
    "Email": "value",
    ...
  },
  "missing_fields": ["field1", "field2"],
  "confidence": "high/medium/low"
}
`;

    const fillResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: fillPrompt
          }
        ]
      }),
    });

    if (!fillResponse.ok) {
      throw new Error(`Fill failed: ${fillResponse.status}`);
    }

    const fillData = await fillResponse.json();
    let fillResult = fillData.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON from markdown
    const fillJsonMatch = fillResult.match(/```json\n([\s\S]*?)\n```/);
    if (fillJsonMatch) {
      fillResult = fillJsonMatch[1];
    }

    const filledForm = JSON.parse(fillResult);

    // Step 3: Validation
    const allFieldsFilled = formStructure.fields.every((field: any) => 
      filledForm.filled_fields[field.label] && 
      filledForm.filled_fields[field.label] !== "N/A"
    );

    const accuracy = allFieldsFilled ? "100%" : 
      `${Math.round((Object.keys(filledForm.filled_fields).length / formStructure.fields.length) * 100)}%`;

    console.log(`Form auto-fill complete with ${accuracy} accuracy`);

    return new Response(
      JSON.stringify({
        success: true,
        form_structure: formStructure,
        filled_data: filledForm.filled_fields,
        missing_fields: filledForm.missing_fields || [],
        accuracy,
        complete: allFieldsFilled
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-fill-form:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
