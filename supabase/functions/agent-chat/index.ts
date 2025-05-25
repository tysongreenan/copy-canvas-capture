
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
    const { message, threadId, assistantId, projectId, useFineTunedModel, contentTypeFilter, history, memories } = await req.json();

    // --- START DEBUG LOGS ---
    console.log("--- AGENT CHAT DEBUG ---");
    console.log("Received message:", message);
    console.log("Received projectId:", projectId);
    console.log("Received threadId:", threadId);
    console.log("Received contentTypeFilter:", contentTypeFilter);
    console.log("Received history:", JSON.stringify(history));
    console.log("Received memories:", JSON.stringify(memories));
    // --- END DEBUG LOGS ---

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
          'OpenAI-Beta': 'assistants=v2'
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
    let ragSources = [];
    
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

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          // Use a lower similarity threshold for better fuzzy matching
          const similarityThreshold = 0.2;
          
          // Prepare parameters for the match_documents_multilevel function
          const matchParams: any = {
            query_embedding: embedding,
            match_threshold: similarityThreshold,
            match_count: 10,
            p_project_id: projectId
          };
          
          // Add content type filter if provided
          if (contentTypeFilter) {
            matchParams.p_content_type = contentTypeFilter;
          }

          // --- START DEBUG LOGS ---
          console.log("Match documents parameters:", JSON.stringify(matchParams));
          // --- END DEBUG LOGS ---

          // Perform vector similarity search with optional content type filter
          const { data: similarDocs, error } = await supabase.rpc(
            'match_documents_quality_weighted',
            matchParams
          );

          if (!error && similarDocs && similarDocs.length > 0) {
            // Separate project and global results
            const projectResults = similarDocs.filter(doc => doc.source_type === 'project');
            const globalResults = similarDocs.filter(doc => doc.source_type === 'global');
            
            let contextSections = [];
            
            if (projectResults.length > 0) {
              contextSections.push(
                "=== YOUR PROJECT CONTENT ===\n" + 
                projectResults.map((doc, index) => 
                  `Project Content ${index + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%, Quality: ${doc.quality_score.toFixed(0)}%):\n${doc.content}\n`
                ).join("\n")
              );
            }
            
            if (globalResults.length > 0) {
              contextSections.push(
                "=== MARKETING KNOWLEDGE BASE ===\n" + 
                globalResults.map((doc, index) => {
                  const metadata = doc.metadata || {};
                  return `Marketing Principle ${index + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%, Quality: ${doc.quality_score.toFixed(0)}%):\nSource: ${doc.source_info}\nType: ${metadata.content_type || 'Unknown'}\nDomain: ${metadata.marketing_domain || 'General'}\n\n${doc.content}\n`;
                }).join("\n")
              );
              
              // Track sources for attribution
              ragSources = similarDocs.map(doc => ({
                source: doc.source_info,
                content: doc.content.substring(0, 200) + '...',
                similarity: doc.similarity,
                quality_score: doc.quality_score,
                weighted_score: doc.weighted_score,
                metadata: doc.metadata,
                contentType: doc.metadata?.type || doc.content_type || 'Unknown'
              }));
            }
            
            relevantContexts = contextSections.join("\n");
            
            console.log(`Found ${projectResults.length} project documents and ${globalResults.length} marketing principles`);
            hasRAGResults = true;
          } else {
            console.log(`No relevant documents found with threshold ${similarityThreshold}${contentTypeFilter ? ` and content type '${contentTypeFilter}'` : ''}`);
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
    let hasMemories = false;
    if (memories && memories.length > 0) {
      try {
        relevantContexts += "\n\n=== CONVERSATION CONTEXT ===\nRelevant insights from previous conversations:";
        
        memories.forEach((memory, index) => {
          relevantContexts += `\n\nInsight ${index + 1}: ${memory.content}`;
        });
        
        relevantContexts += "\n\nUse these insights when relevant, building on previous context.";
        hasMemories = true;
      } catch (memoryError) {
        console.error("Error processing memories:", memoryError);
      }
    }

    // Create a system message with instructions for handling no-context situations
    let systemPrompt = "";
    
    // Updated system prompt logic
    if (projectId && !hasRAGResults) {
      systemPrompt = contentTypeFilter 
        ? `You are an AI assistant specializing in marketing research and strategy.
IMPORTANT INSTRUCTIONS:
1. I couldn't find any relevant information in the '${contentTypeFilter}' content type for your query within the provided project content.
2. If you'd like, I can search across all content types instead, or you can try a different question.
3. When using general knowledge, make it clear to the user that you're not drawing from their specific documents.
4. Suggest to the user what kind of information they might want to add to their knowledge base if they're looking for more specific answers.
`
        : `You are an AI assistant specializing in marketing research and strategy.
When answering, consider both general marketing knowledge and any specific context provided.
IMPORTANT INSTRUCTIONS:
1. If no relevant context is provided from the knowledge base, use your general marketing knowledge to give a helpful response.
2. When using general knowledge, make it clear to the user that you're not drawing from their specific documents.
3. Never say that you couldn't find information or refuse to answer. Instead, provide general marketing insights that might be helpful.
4. Suggest to the user what kind of information they might want to add to their knowledge base if they're looking for more specific answers.
`;
    } else if (!projectId) {
      systemPrompt = `You are a helpful AI assistant specializing in general marketing knowledge.
IMPORTANT INSTRUCTIONS:
1. Answer questions based on your general marketing knowledge.
2. Clearly state that you are providing general marketing insights.
3. If a question seems to imply specific project context, gently guide the user to either provide a project ID or clarify that you are drawing on general knowledge.
`;
    } else {
      systemPrompt = `You are a senior marketing strategist and direct response copy chief with access to a comprehensive knowledge base of proven marketing principles, frameworks, and examples from industry legends like Claude Hopkins, David Ogilvy, Eugene Schwartz, and modern experts.
Your expertise spans:
- Classic direct response principles and scientific advertising methods
- Modern conversion optimization and growth marketing
- Copywriting frameworks (AIDA, PAS, Before/After/Bridge, StoryBrand, JTBD)
- Brand strategy, positioning, and messaging
- Email marketing, social media, and content strategy
- Psychological triggers and persuasion techniques

Always:
- Reference specific marketing principles and frameworks from the provided context when relevant
- Cite authoritative sources (Hopkins, Ogilvy, etc.) to back up recommendations from context
- Ask clarifying questions to understand their goal, target customer, and offer IF THE CONTEXT IS INSUFFICIENT
- Explain your reasoning using proven marketing frameworks from context
- Provide concrete examples and actionable advice from context
- Challenge unclear requests and suggest better approaches IF THE CONTEXT IS INSUFFICIENT
- Teach marketing principles while solving immediate problems
- Prioritize information from "YOUR PROJECT CONTENT" over "MARKETING KNOWLEDGE BASE" if both are provided.

When giving advice, blend:
- Timeless marketing principles from your knowledge base context
- Project-specific insights from their content context
- Modern best practices and testing approaches
- Specific examples and case studies from context

Your goal: Transform every user into a more strategic marketer while delivering exceptional results.
`;
    }

    // Add the user's message to the thread, along with relevant context if available
    const userMessageContent = relevantContexts 
      ? `${message}\n\n${relevantContexts}` 
      : message;
      
    const messages = [];

    // Add the dynamic system prompt as the first message
    messages.push({
      role: "system",
      content: systemPrompt
    });

    // Add conversation history if available
    if (history && history.length > 0) {
      const cleanedHistory = history.filter(msg => !msg.content.startsWith('[System Note:') && msg.role !== 'system');
      messages.push(...cleanedHistory);
    }
    
    // Add the user's current query
    messages.push({
      role: "user",
      content: userMessageContent
    });

    // --- START DEBUG LOGS ---
    console.log("Final messages array sent to OpenAI:", JSON.stringify(messages));
    // --- END DEBUG LOGS ---

    // Run the assistant on the thread with the specified model override
    const runPayload: any = {
      assistant_id: assistantId
    };
    
    // Override the model with the fine-tuned model if requested
    if (useFineTunedModel) {
      runPayload.model = "ft:gpt-4o-mini-2024-07-18:personal::AzyZoigT";
    }
    
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
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
    const maxAttempts = 60;
    
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
        'OpenAI-Beta': 'assistants=v2'
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
