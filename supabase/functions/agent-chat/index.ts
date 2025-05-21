
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
    const { message, threadId, projectId, contentTypeFilter } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message: "${message}"`);
    console.log(`Project ID: ${projectId || 'Not provided'}`);
    console.log(`Content type filter: ${contentTypeFilter || 'None'}`);

    // Initialize Supabase client for RAG search if needed
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, let's create or use an existing thread
    const currentThreadId = threadId || crypto.randomUUID();
    console.log(`Using thread ID: ${currentThreadId}`);

    // Search for relevant documents using embeddings
    let relevantContext = "";
    if (projectId) {
      try {
        // Generate embedding for the query
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: message,
            model: 'text-embedding-3-small',
          }),
        });

        if (!embeddingResponse.ok) {
          const error = await embeddingResponse.json();
          throw new Error(error.error?.message || 'Failed to generate embedding');
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Use a lower similarity threshold for better fuzzy matching
        const similarityThreshold = 0.2;
        
        // Prepare parameters for the match_documents function
        const matchParams: any = {
          query_embedding: embedding,
          match_threshold: similarityThreshold,
          match_count: 5,
          p_project_id: projectId
        };
        
        // Add content type filter if provided
        if (contentTypeFilter) {
          matchParams.content_type = contentTypeFilter;
        }
        
        // Perform vector similarity search with optional content type filter
        const { data: similarDocs, error } = await supabase.rpc(
          'match_documents',
          matchParams
        );

        if (error) {
          throw new Error(`Search error: ${error.message}`);
        }

        if (similarDocs && similarDocs.length > 0) {
          console.log(`Found ${similarDocs.length} relevant documents`);
          relevantContext = "Here's relevant information from the knowledge base:\n\n" + 
            similarDocs.map((doc: any, index: number) => 
              `[Document ${index + 1}]: ${doc.content}`
            ).join("\n\n");
        } else {
          console.log("No relevant documents found");
          relevantContext = "No relevant information was found in the knowledge base.";
        }
      } catch (error) {
        console.error("Error in RAG search:", error);
        relevantContext = "There was an error searching the knowledge base: " + error.message;
      }
    }

    // Send the request to OpenAI with system instructions and relevant context
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
            content: `You are an intelligent assistant for the Lumen platform, specialized in marketing research and content analysis.
            You provide thoughtful, well-reasoned responses based on the user's query and any relevant information from their content.
            
            When answering:
            1. Use the provided relevant information when available
            2. Cite your sources when providing information
            3. Be honest when you don't know something
            4. Organize your responses clearly
            5. Provide actionable insights when possible`
          },
          {
            role: 'user',
            content: relevantContext ? `${relevantContext}\n\nUser question: ${message}` : message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    
    // Prepare reasoning steps (in this implementation, we're simulating them)
    const steps = [
      { 
        type: "retrieval", 
        content: relevantContext || "No context retrieval was performed."
      },
      {
        type: "reasoning",
        content: "Processed user query and formulated a response based on available information."
      }
    ];

    // Log the response for debugging
    console.log("Successfully generated AI response");

    // Return sources if any were found
    const sources = projectId ? (await supabase.rpc(
      'match_documents',
      {
        query_embedding: (await (await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: message,
            model: 'text-embedding-3-small',
          }),
        })).json()).data[0].embedding,
        match_threshold: 0.2,
        match_count: 5,
        p_project_id: projectId
      }
    )).data || [] : [];

    // Include metadata in response
    return new Response(
      JSON.stringify({
        message: aiResponse.choices[0].message.content,
        threadId: currentThreadId,
        reasoning: steps, 
        contentTypeFilter: contentTypeFilter || null,
        sources: sources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in agent-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
