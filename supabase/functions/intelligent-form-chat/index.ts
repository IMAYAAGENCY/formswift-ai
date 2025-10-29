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
    const { formImage, messages, userData } = await req.json();
    
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

    console.log('Processing form chat with AI...');

    // Build context for AI
    let systemPrompt = `You are an intelligent form filling assistant. Your job is to:
1. Analyze uploaded form images and detect all fields
2. Help users fill forms by asking clarifying questions
3. Provide suggestions based on user data
4. Guide users through the form filling process step by step
5. Answer questions about form fields

When a user uploads a form:
- Extract all visible text and field labels
- Identify field types (text, email, phone, date, etc.)
- Ask for missing information conversationally
- Provide smart suggestions based on context

Always be helpful, conversational, and guide users naturally through the form filling process.`;

    if (userData && Object.keys(userData).length > 0) {
      systemPrompt += `\n\nUser's available data: ${JSON.stringify(userData)}`;
    }

    // Prepare messages for AI
    const aiMessages = [
      { role: 'user', content: [] as any[] }
    ];

    // Add form image if present
    if (formImage) {
      aiMessages[0].content.push({
        type: 'text',
        text: 'Please analyze this form image and help me fill it. Tell me what fields you detect and what information you need from me.'
      });
      aiMessages[0].content.push({
        type: 'image_url',
        image_url: { url: formImage }
      });
    }

    // Add chat history
    if (messages && messages.length > 0) {
      messages.forEach((msg: any) => {
        if (msg.role === 'user' && !formImage) {
          aiMessages[0].content.push({
            type: 'text',
            text: msg.content
          });
        }
      });
    }

    // If no content, add default
    if (aiMessages[0].content.length === 0) {
      aiMessages[0].content.push({
        type: 'text',
        text: 'Hello! I need help filling a form.'
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...aiMessages
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I could not process your request. Please try again.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        reply 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in intelligent-form-chat:', error);
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
