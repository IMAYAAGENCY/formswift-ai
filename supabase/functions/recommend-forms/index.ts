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
    const { formId } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current form details
    const { data: currentForm } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    // Get user's other forms
    const { data: userForms } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .neq('id', formId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!userForms || userForms.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating AI recommendations...');

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
            content: `Based on this form "${currentForm.form_name}", analyze these similar forms and recommend the top 3 most relevant ones. Return a JSON array with form IDs and similarity scores (0-1). User's forms: ${JSON.stringify(userForms.map(f => ({ id: f.id, name: f.form_name })))}`
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let recommendations = data.choices?.[0]?.message?.content || '[]';

    // Extract JSON from markdown if present
    const jsonMatch = recommendations.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      recommendations = jsonMatch[1];
    }

    const parsedRecommendations = JSON.parse(recommendations);

    // Store recommendations
    await supabase
      .from('form_recommendations')
      .insert({
        user_id: user.id,
        form_id: formId,
        recommended_forms: parsedRecommendations,
        similarity_score: 0.8
      });

    console.log('Recommendations generated successfully');

    return new Response(
      JSON.stringify({ recommendations: parsedRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});