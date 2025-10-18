import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId, formId, text } = await req.json();

    if (!submissionId || !formId || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing sentiment for submission:', submissionId);

    // Call Lovable AI for sentiment analysis
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
            content: 'You are a sentiment analysis expert. Analyze the provided text and return a JSON object with: sentiment_label (positive/negative/neutral/mixed), sentiment_score (-1 to 1), confidence (0 to 1), key_phrases (array of important phrases), and emotions (object with emotion names and intensity 0-1).'
          },
          {
            role: 'user',
            content: `Analyze the sentiment of this text: "${text}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_sentiment",
              description: "Analyze the sentiment of the provided text",
              parameters: {
                type: "object",
                properties: {
                  sentiment_label: {
                    type: "string",
                    enum: ["positive", "negative", "neutral", "mixed"]
                  },
                  sentiment_score: {
                    type: "number",
                    description: "Score from -1 (most negative) to 1 (most positive)"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence level from 0 to 1"
                  },
                  key_phrases: {
                    type: "array",
                    items: { type: "string" }
                  },
                  emotions: {
                    type: "object",
                    description: "Emotion names as keys with intensity 0-1 as values"
                  }
                },
                required: ["sentiment_label", "sentiment_score", "confidence", "key_phrases", "emotions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_sentiment" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from('sentiment_analysis')
      .insert({
        submission_id: submissionId,
        form_id: formId,
        sentiment_score: analysis.sentiment_score,
        sentiment_label: analysis.sentiment_label,
        confidence: analysis.confidence,
        key_phrases: analysis.key_phrases,
        emotions: analysis.emotions,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Sentiment analysis saved successfully');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-sentiment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
