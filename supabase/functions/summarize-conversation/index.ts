
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation } = await req.json();

    if (!conversation) {
      return new Response(JSON.stringify({ error: "Missing conversation parameter" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant tasked with summarizing conversations between a user and an assistant. 
            Summarize the key points, questions, decisions, and insights. Focus on extracting the most important information that would be useful 
            for future reference and context. Keep the summary concise yet comprehensive, around 3-5 sentences.`
          },
          { role: 'user', content: `Please summarize this conversation:\n\n${conversation}` }
        ],
        temperature: 0.3, // Lower temperature for more deterministic summaries
        max_tokens: 400, // Enough tokens for a comprehensive summary
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in summarize-conversation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
