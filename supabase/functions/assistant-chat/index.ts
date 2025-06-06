
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
    const { message, threadId, assistantId, projectId, useFineTunedModel, contentTypeFilter } = await req.json();

    if (!message || !assistantId) {
      return new Response(
        JSON.stringify({ error: 'Message and assistantId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message: "${message}" with assistant ${assistantId}`);
    console.log(`Using fine-tuned model: ${useFineTunedModel ? 'Yes' : 'No'}`);
    console.log(`Content type filter: ${contentTypeFilter || 'None'}`);

    let activeThreadId = threadId;
    
    // Initialize Supabase client for RAG search
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // If no thread ID is provided, create a new thread
    if (!activeThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2' // Updated to use v2
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.json();
        throw new Error(error.error?.message || 'Failed to create thread');
      }

      const threadData = await threadResponse.json();
      activeThreadId = threadData.id;
      console.log(`Created new thread with ID: ${activeThreadId}`);
    }

    // If projectId is provided, search for relevant documents in our RAG system
    let relevantContexts = "";
    let hasRAGResults = false;
    
    if (projectId) {
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

        // Use a lower similarity threshold for better fuzzy matching - reduced further to catch more potential matches
        const similarityThreshold = 0.2; // Lowered from 0.3 to catch more potential matches
        
        // Prepare parameters for the match_documents function
        const matchParams: any = {
          query_embedding: embedding,
          match_threshold: similarityThreshold,
          match_count: 10, // Retrieve more documents (increased from 5)
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

        if (!error && similarDocs && similarDocs.length > 0) {
          // Format documents for assistant input
          relevantContexts = "Relevant context from the knowledge base:\n\n" + 
            similarDocs.map((doc: any, index: number) => 
              `Document ${index + 1}:\n${doc.content}\nSource: ${doc.metadata?.source || 'Unknown'}\nType: ${doc.metadata?.type || 'Unknown'}`
            ).join("\n\n");
          
          console.log(`Found ${similarDocs.length} relevant documents from knowledge base${contentTypeFilter ? ` with type '${contentTypeFilter}'` : ''}`);
          hasRAGResults = true;
        } else {
          console.log(`No relevant documents found with threshold ${similarityThreshold}${contentTypeFilter ? ` and content type '${contentTypeFilter}'` : ''}`);
        }
      }
    }

    // Compose a system message to keep the marketing tone consistent
    let systemPrompt = `
You are an AI assistant specializing in marketing research and strategy.
Always keep a friendly marketing tone in your replies.
Use any retrieved context from the knowledge base when available to tailor your answer.
`;

    // Add extra instructions when no relevant context was found
    if (projectId && !hasRAGResults) {
      systemPrompt += contentTypeFilter
        ? `
IMPORTANT INSTRUCTIONS:
1. I couldn't find any relevant information in the '${contentTypeFilter}' content type for your query.
2. If you'd like, I can search across all content types instead, or you can try a different question.
3. When using general knowledge, make it clear to the user that you're not drawing from their specific documents.
4. Suggest to the user what kind of information they might want to add to their knowledge base if they're looking for more specific answers.
`
        : `
IMPORTANT INSTRUCTIONS:
1. No relevant context was found for your query, so use your general marketing knowledge to give a helpful response.
2. When using general knowledge, make it clear to the user that you're not drawing from their specific documents.
3. Never say that you couldn't find information or refuse to answer. Instead, provide general marketing insights that might be helpful.
4. Suggest to the user what kind of information they might want to add to their knowledge base if they're looking for more specific answers.
`;
    }

    // Add the user's message to the thread, along with relevant context if available
    const userMessageContent = relevantContexts 
      ? `${message}\n\n${relevantContexts}` 
      : message;
      
    const messagePayload: any = {
      role: 'user',
      content: userMessageContent
    };
    
    // Always add a system message before the user message
    const systemMessageResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2' // Updated to use v2
      },
      body: JSON.stringify({
        role: 'user',
        content: `[System Note: ${systemPrompt}]`
      })
    });

    if (!systemMessageResponse.ok) {
      const error = await systemMessageResponse.json();
      console.error("Failed to add system message:", error);
      // Continue with the user message even if system message fails
    }
    
    // Now add the user message
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2' // Updated to use v2
      },
      body: JSON.stringify(messagePayload)
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      throw new Error(error.error?.message || 'Failed to add message to thread');
    }

    // Run the assistant on the thread with the specified model override for Marketing Research assistant
    const runPayload: any = {
      assistant_id: assistantId
    };
    
    // Override the model with the fine-tuned model if it's the Marketing Research assistant
    if (useFineTunedModel) {
      runPayload.model = "ft:gpt-4o-mini-2024-07-18:personal::AzyZoigT";
    }
    
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2' // Updated to use v2
      },
      body: JSON.stringify(runPayload)
    });

    if (!runResponse.ok) {
      const error = await runResponse.json();
      throw new Error(error.error?.message || 'Failed to run assistant');
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for the run to complete
    let runStatus = runData.status;
    let attempts = 0;
    const maxAttempts = 60; // Maximum 60 attempts with 1 second delay = 1 minute timeout
    
    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'expired' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2' // Updated to use v2
        }
      });

      if (!runCheckResponse.ok) {
        const error = await runCheckResponse.json();
        throw new Error(error.error?.message || 'Failed to check run status');
      }

      const runCheckData = await runCheckResponse.json();
      runStatus = runCheckData.status;
      attempts++;
      
      console.log(`Run status check ${attempts}: ${runStatus}`);
    }

    if (runStatus !== 'completed') {
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }

    // Get the assistant's response
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2' // Updated to use v2
      }
    });

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json();
      throw new Error(error.error?.message || 'Failed to get messages');
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant');

    if (!assistantMessage) {
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

    // Return the response with metadata
    return new Response(
      JSON.stringify({ 
        message: responseContent, 
        threadId: activeThreadId,
        contentTypeFilter: contentTypeFilter || null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assistant-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
