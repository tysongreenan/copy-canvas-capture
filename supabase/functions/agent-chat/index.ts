
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
    console.error("OpenAI API key not configured");
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log("=== AGENT CHAT FUNCTION START ===");
    
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody, null, 2));
    
    const { 
      message, 
      threadId, 
      assistantId, 
      projectId, 
      taskType = 'general',
      modelName = 'gpt-4o-mini',
      temperature = 0.7,
      maxTokens = 1500,
      memories = [],
      usePromptChain = true,
      qualityThreshold = 90,
      maxIterations = 3,
      minQualityScore = 60,
      enableMultiStepReasoning = false
    } = requestBody;

    if (!message || !assistantId) {
      console.error("Missing required fields: message or assistantId");
      return new Response(
        JSON.stringify({ error: 'Message and assistantId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message: "${message}"`);
    console.log(`Assistant ID: ${assistantId}`);
    console.log(`Project ID: ${projectId}`);
    console.log(`Task Type: ${taskType}`);

    let activeThreadId = threadId;
    
    // Initialize Supabase client for RAG search
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // If no thread ID is provided, create a new thread
    if (!activeThreadId) {
      console.log("Creating new thread...");
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.json();
        console.error("Failed to create thread:", error);
        throw new Error(error.error?.message || 'Failed to create thread');
      }

      const threadData = await threadResponse.json();
      activeThreadId = threadData.id;
      console.log(`Created new thread with ID: ${activeThreadId}`);
    }

    // RAG search functionality
    let relevantContexts = "";
    let ragSources = [];
    
    if (projectId) {
      try {
        console.log("Starting RAG search...");
        
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

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;
          console.log(`Generated embedding with ${embedding.length} dimensions`);

          // Search for similar documents
          const { data: similarDocs, error } = await supabase.rpc(
            'match_documents_quality_weighted',
            {
              query_embedding: embedding,
              match_threshold: 0.2,
              match_count: 10,
              p_project_id: projectId,
              p_content_type: null,
              include_global: true,
              p_marketing_domain: null,
              p_complexity_level: null,
              p_min_quality_score: minQualityScore
            }
          );

          if (!error && similarDocs && similarDocs.length > 0) {
            console.log(`Found ${similarDocs.length} relevant documents`);
            
            const projectResults = similarDocs.filter(doc => doc.source_type === 'project');
            const globalResults = similarDocs.filter(doc => doc.source_type === 'global');
            
            let contextSections = [];
            
            if (projectResults.length > 0) {
              contextSections.push(
                "=== YOUR PROJECT CONTENT ===\n" + 
                projectResults.map((doc, index) => 
                  `Project Content ${index + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%):\n${doc.content}\n`
                ).join("\n")
              );
            }
            
            if (globalResults.length > 0) {
              contextSections.push(
                "=== MARKETING KNOWLEDGE BASE ===\n" + 
                globalResults.map((doc, index) => 
                  `Marketing Principle ${index + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%):\n${doc.content}\n`
                ).join("\n")
              );
            }
            
            relevantContexts = contextSections.join("\n");
            ragSources = similarDocs.map(doc => ({
              id: doc.id,
              content: doc.content.substring(0, 200) + '...',
              similarity: doc.similarity,
              quality_score: doc.quality_score,
              weighted_score: doc.weighted_score,
              source_type: doc.source_type,
              source_info: doc.source_info
            }));
          } else {
            console.log("No relevant documents found");
          }
        } else {
          console.error("Failed to generate embedding for RAG search");
        }
      } catch (ragError) {
        console.error("Error in RAG search:", ragError);
        // Continue without RAG results
      }
    }

    // Add memory context if available
    if (memories && memories.length > 0) {
      console.log(`Adding ${memories.length} memories to context`);
      relevantContexts += "\n\n=== CONVERSATION CONTEXT ===\nRelevant insights from previous conversations:\n";
      memories.forEach((memory, index) => {
        relevantContexts += `\nInsight ${index + 1}: ${memory.content}`;
      });
    }

    // Create system prompt
    const systemPrompt = `You are a senior marketing strategist and direct response copy chief with access to a comprehensive knowledge base of proven marketing principles, frameworks, and examples from industry legends like Claude Hopkins, David Ogilvy, Eugene Schwartz, and modern experts.

Always:
- Reference specific marketing principles and frameworks from the provided context when relevant
- Provide concrete examples and actionable advice from context
- Prioritize information from "YOUR PROJECT CONTENT" over "MARKETING KNOWLEDGE BASE" if both are provided
- When using general knowledge, make it clear you're not drawing from their specific documents

Your goal: Transform every user into a more strategic marketer while delivering exceptional results.`;

    // Add the user's message to the thread
    const userMessageContent = relevantContexts 
      ? `${message}\n\n${relevantContexts}` 
      : message;

    console.log("Adding user message to thread...");
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: userMessageContent
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      console.error("Failed to add message to thread:", error);
      throw new Error(error.error?.message || 'Failed to add message to thread');
    }

    // Run the assistant
    console.log("Starting assistant run...");
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        model: modelName,
        temperature: temperature,
        max_tokens: maxTokens
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.json();
      console.error("Failed to run assistant:", error);
      throw new Error(error.error?.message || 'Failed to run assistant');
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log(`Started run with ID: ${runId}`);

    // Poll for the run to complete with timeout
    let runStatus = runData.status;
    let attempts = 0;
    const maxAttempts = 30; // Reduced from 60 to 30 seconds max
    
    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'expired' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!runCheckResponse.ok) {
        const error = await runCheckResponse.json();
        console.error("Failed to check run status:", error);
        throw new Error(error.error?.message || 'Failed to check run status');
      }

      const runCheckData = await runCheckResponse.json();
      runStatus = runCheckData.status;
      attempts++;
      
      console.log(`Run status check ${attempts}: ${runStatus}`);
    }

    if (runStatus !== 'completed') {
      console.error(`Run did not complete successfully. Status: ${runStatus} after ${attempts} attempts`);
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }

    // Get the assistant's response
    console.log("Fetching assistant response...");
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json();
      console.error("Failed to get messages:", error);
      throw new Error(error.error?.message || 'Failed to get messages');
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant');

    if (!assistantMessage) {
      console.error("No assistant message found in response");
      throw new Error('No assistant message found');
    }

    // Extract the text content from the message
    let responseContent = '';
    if (assistantMessage.content && assistantMessage.content.length > 0) {
      assistantMessage.content.forEach(content => {
        if (content.type === 'text') {
          responseContent += content.text.value;
        }
      });
    }

    console.log("Assistant response extracted successfully");

    // Return the response with metadata
    const response = {
      message: responseContent,
      threadId: activeThreadId,
      sources: ragSources,
      reasoning: [],
      confidence: undefined,
      evaluation: undefined
    };

    console.log("=== AGENT CHAT FUNCTION SUCCESS ===");
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== AGENT CHAT FUNCTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Check function logs for more information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
