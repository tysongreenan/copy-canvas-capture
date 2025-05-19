
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { query, projectId, conversationId, history } = await req.json();

    if (!query || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Query and projectId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small',
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      throw new Error(error.error?.message || 'Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Search for similar content in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get JWT from the authorization header
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    // Authenticate client if token is provided
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Perform vector similarity search
    const { data: similarDocs, error } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
        p_project_id: projectId
      }
    );

    if (error) {
      throw new Error(`Search error: ${error.message}`);
    }

    // Prepare context from similar documents
    let context = '';
    if (similarDocs && similarDocs.length > 0) {
      context = similarDocs.map((doc: any) => doc.content).join('\n\n');
    }

    // Construct message history for the API call
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant that answers questions based on the following context from a website. 
                 If the answer is not contained in the context, say that you don't have enough information to answer accurately.
                 Context: ${context}`
      }
    ];

    // Add conversation history if available
    if (history && history.length > 0) {
      messages.push(...history);
    }

    // Add the user's current query
    messages.push({
      role: "user",
      content: query
    });

    // Generate AI response
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!completionResponse.ok) {
      const error = await completionResponse.json();
      throw new Error(error.error?.message || 'Failed to generate completion');
    }

    const completionData = await completionResponse.json();
    const aiResponse = completionData.choices[0].message.content;

    // Save messages to conversation if conversation ID is provided
    if (conversationId) {
      // Save user message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: query
        });
      
      // Save assistant message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse
        });
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        sources: similarDocs.map((doc: any) => ({
          content: doc.content.substring(0, 200) + '...',
          similarity: doc.similarity,
          metadata: doc.metadata
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
