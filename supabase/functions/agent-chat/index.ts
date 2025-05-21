
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Agent } from "https://esm.sh/openai-agents@0.1.0";

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

    console.log(`Processing message with Agent framework: "${message}"`);
    console.log(`Project ID: ${projectId || 'Not provided'}`);
    console.log(`Content type filter: ${contentTypeFilter || 'None'}`);

    // Initialize Supabase client for RAG search if needed
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize the OpenAI Agent
    const agent = new Agent({
      apiKey: openAIApiKey,
      debug: true,
    });

    // Define available tools for the agent
    const ragSearchTool = {
      name: "ragSearch",
      description: "Search the knowledge base for relevant information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          contentType: {
            type: "string",
            description: "Optional filter for specific content type"
          }
        },
        required: ["query"]
      },
      handler: async ({ query, contentType }) => {
        console.log(`Executing RAG search for: "${query}" with contentType: ${contentType || 'None'}`);
        
        try {
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

          // Use a lower similarity threshold for better fuzzy matching
          const similarityThreshold = 0.2;
          
          // Prepare parameters for the match_documents function
          const matchParams: any = {
            query_embedding: embedding,
            match_threshold: similarityThreshold,
            match_count: 10,
            p_project_id: projectId
          };
          
          // Add content type filter if provided
          if (contentType) {
            matchParams.content_type = contentType;
          }
          
          // Perform vector similarity search with optional content type filter
          const { data: similarDocs, error } = await supabase.rpc(
            'match_documents',
            matchParams
          );

          if (error) {
            throw new Error(`Search error: ${error.message}`);
          }

          if (!similarDocs || similarDocs.length === 0) {
            return "No relevant information found in the knowledge base.";
          }

          // Format the search results
          const results = similarDocs.map((doc: any) => ({
            content: doc.content,
            metadata: doc.metadata,
            similarity: doc.similarity
          }));

          return JSON.stringify(results);
        } catch (error) {
          console.error("Error in RAG search:", error);
          return "Error searching knowledge base: " + error.message;
        }
      }
    };

    // Add tools to the agent
    agent.addTool(ragSearchTool);

    // Set the system message for the agent
    await agent.setSystemMessage(`
      You are an intelligent assistant for the Lumen platform, specialized in marketing research and content analysis.
      You have access to a knowledge base of content from the user's project that you can search using the ragSearch tool.
      
      When answering:
      1. Use the ragSearch tool to find relevant information before responding
      2. If the user asks about specific content types, use the contentType parameter when searching
      3. Cite your sources when providing information
      4. If no relevant information is found in the knowledge base, be honest about it
      5. Provide organized, clear responses with actionable insights
      
      The goal is to provide users with accurate information based on their project's content.
    `);

    // Prepare the agent's thread
    let threadId = threadId || await agent.createThread();

    // Send the message to the agent and get a response
    const response = await agent.run({
      threadId,
      message,
    });

    // Include metadata in response
    return new Response(
      JSON.stringify({
        message: response.content,
        threadId: response.threadId,
        reasoning: response.steps.map(step => ({
          type: step.type, 
          content: step.content
        })), 
        contentTypeFilter: contentTypeFilter || null
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
