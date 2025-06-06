import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced text preprocessing for better matching
function preprocessSearchText(text: string): string[] {
  if (!text) return [];
  
  const variants = [];
  const cleaned = text.toLowerCase().trim();
  
  // Add original
  variants.push(cleaned);
  
  // Add without articles
  variants.push(cleaned.replace(/^(the|a|an)\s+/i, ''));
  
  // Add individual words for partial matching
  const words = cleaned.split(/\s+/).filter(word => word.length > 2);
  variants.push(...words);
  
  // Add combinations for compound terms
  if (words.length > 1) {
    variants.push(words.join(' '));
    variants.push(words.join(''));
  }
  
  return [...new Set(variants)];
}

// Create context-aware search queries
function createSearchQueries(originalQuery: string): string[] {
  const queries = [originalQuery];
  const lowerQuery = originalQuery.toLowerCase();
  
  // If asking about "the junction", add business context
  if (lowerQuery.includes('junction')) {
    queries.push('Junction Stouffville development project');
    queries.push('Junction mixed-use development');
    queries.push('Stouffville Junction real estate');
    queries.push('Junction community project');
  }
  
  // Add other common business query patterns
  if (lowerQuery.match(/^(what is|tell me about|describe)\s+/)) {
    const subject = lowerQuery.replace(/^(what is|tell me about|describe)\s+/, '');
    queries.push(subject);
    queries.push(`${subject} project`);
    queries.push(`${subject} development`);
  }
  
  return queries;
}

serve(async (req) => {
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
    const requestBody = await req.json();
    const {
      message,
      threadId, // Note: threadId from frontend corresponds to conversation_id in database
      projectId,
      taskType = 'general',
      enableTools = true,
      enableMultiStepReasoning = false,
      modelName = 'gpt-4o-mini',
      temperature = 0.7,
      maxTokens = 1500,
      memories = [],
      usePromptChain = false,
      qualityThreshold = 90,
      maxIterations = 3,
      minQualityScore = 60
    } = requestBody;

    console.log(`Processing message for thread ${threadId}, project ${projectId}, task type ${taskType}`);
    console.log(`Minimum quality score: ${minQualityScore}%`);
    console.log(`Using prompt chain: ${usePromptChain}, Max iterations: ${maxIterations}, Quality threshold: ${qualityThreshold}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    let settings = null;
    if (projectId) {
      const { data: s } = await supabase
        .from('workspace_rag_settings')
        .select('similarity_threshold, min_quality_score')
        .eq('workspace_id', projectId)
        .single();
      settings = s;
    }

    let ragResults = [];
    let hasRAGResults = false;

    // Enhanced RAG search with multiple strategies
    if (projectId) {
      console.log(`Performing quality-weighted RAG search for project: ${projectId}`);
      
      // Create multiple search queries for better matching
      const searchQueries = createSearchQueries(message);
      console.log(`Generated search queries: ${JSON.stringify(searchQueries)}`);
      
      // Try different similarity thresholds based on workspace settings
      const baseThreshold = settings?.similarity_threshold ?? 0.3;
      const thresholds = [baseThreshold, baseThreshold - 0.1, baseThreshold - 0.2].filter(t => t > 0);
      const minQualityNormalized = settings?.min_quality_score ?? minQualityScore / 100.0;
      
      for (const query of searchQueries) {
        if (hasRAGResults) break;
        
        // Generate embedding for current query variant
        console.log(`Generating embedding for query: "${query}"`);
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
          console.error('Failed to generate embedding');
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        for (const threshold of thresholds) {
          if (hasRAGResults) break;
          
          console.log(`Using similarity threshold: ${threshold}, min quality score: ${minQualityScore}% (${minQualityNormalized})`);
          
          try {
            // Call the corrected function with proper parameter names
            const { data: documents, error } = await supabase.rpc(
              'match_documents_quality_weighted',
              {
                query_embedding: queryEmbedding,
                match_threshold: threshold,
                match_count: 8,
                p_project_id: projectId,
                p_content_type: null,
                include_global: false, // Focus on project content first
                p_marketing_domain: null,
                p_complexity_level: null,
                p_min_quality_score: minQualityNormalized
              }
            );

            if (error) {
              console.error(`RAG search error: ${JSON.stringify(error)}`);
              continue;
            }

            if (documents && documents.length > 0) {
              console.log(`Found ${documents.length} relevant documents with threshold ${threshold} and min quality ${minQualityScore}%`);
              ragResults = documents;
              hasRAGResults = true;
              break;
            } else {
              console.log(`No relevant documents found with threshold ${threshold} and min quality ${minQualityScore}%`);
            }
          } catch (searchError) {
            console.error(`Search attempt failed: ${searchError}`);
            continue;
          }
        }
      }

      // If no project results, try global knowledge
      if (!hasRAGResults) {
        console.log('No project results found, trying global knowledge...');
        
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
          const queryEmbedding = embeddingData.data[0].embedding;

          const { data: globalDocs, error: globalError } = await supabase.rpc(
            'match_documents_quality_weighted',
            {
              query_embedding: queryEmbedding,
              match_threshold: 0.2,
              match_count: 5,
              p_project_id: null,
              p_content_type: null,
              include_global: true,
              p_marketing_domain: null,
              p_complexity_level: null,
              p_min_quality_score: 0.6
            }
          );

          if (!globalError && globalDocs && globalDocs.length > 0) {
            console.log(`Found ${globalDocs.length} global knowledge results`);
            ragResults = globalDocs;
            hasRAGResults = true;
          }
        }
      }
    }

    // Build enhanced context
    let context = '';
    if (hasRAGResults && ragResults.length > 0) {
      context = ragResults.map((doc: any) => {
        const sourceInfo = doc.source_info || 'Unknown source';
        const qualityScore = doc.quality_score || 'N/A';
        return `[Source: ${sourceInfo}, Quality: ${qualityScore}]\n${doc.content}`;
      }).join('\n\n');
      
      console.log(`Built context from ${ragResults.length} documents`);
    }

    // Add memories to context if available
    if (memories && memories.length > 0) {
      const memoryContext = memories.map((memory: any) => memory.content).join('\n\n');
      context = context ? `${context}\n\nPrevious Context:\n${memoryContext}` : memoryContext;
      console.log(`Added ${memories.length} memories to context`);
    }

    // Enhanced system prompt with project awareness
    const systemPrompt = `You are a helpful, knowledgeable, and conversational AI assistant. Your goal is to provide clear, accurate, and engaging responses that are easy to understand and actionable.

${context ? `## Available Context
${context}

` : ''}## Core Instructions
- **Be conversational and friendly**: Write in a natural, engaging tone like you're talking to a colleague
- **Structure your responses clearly**: Use headings, bullet points, and formatting to make information easy to scan
- **Be comprehensive but concise**: Provide thorough answers without being verbose
- **Show your reasoning**: When making recommendations or drawing conclusions, briefly explain your thinking
- **Use examples**: Include practical examples or use cases when helpful
- **Ask clarifying questions**: If the request is ambiguous, ask specific questions to better help

## Response Formatting
- Use **bold text** for key concepts and important points
- Use bullet points or numbered lists for multiple items
- Use code blocks for technical content, file paths, or commands
- Use > quotes for important notes or warnings
- Break up long responses with clear section headers

## Context Guidelines
- If you have relevant context above, prioritize it over general knowledge
- Always cite specific details from the context when referencing project information
- If context is incomplete or unclear, acknowledge limitations and suggest next steps
- For project-specific topics, focus on the specific context rather than general information

## Quality Standards
- Ensure accuracy over speed - if you're unsure, say so
- Provide actionable advice when possible
- Consider the user's likely intent and provide proactive suggestions
- Maintain consistency with previous responses in the conversation

Current task type: ${taskType}
Current expertise focus: ${taskType === 'research' ? 'Deep analysis and fact-finding' : taskType === 'marketing' ? 'Persuasive and engaging content' : taskType === 'email' ? 'Professional and clear communication' : taskType === 'summary' ? 'Concise and comprehensive overviews' : taskType === 'content' ? 'Creative and informative writing' : 'General assistance and problem-solving'}`;

    console.log('OpenAI response received');

    // Get recent conversation history for better context
    let conversationHistory: any[] = [];
    if (threadId) {
      try {
        const { data: recentMessages } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('conversation_id', threadId)
          .order('created_at', { ascending: false })
          .limit(6); // Get last 6 messages (3 exchanges)
        
        if (recentMessages && recentMessages.length > 0) {
          // Reverse to chronological order and exclude the current message
          conversationHistory = recentMessages
            .reverse()
            .filter(msg => msg.content !== message)
            .slice(-4); // Keep only last 4 messages for context
          
          console.log(`Found ${conversationHistory.length} previous messages for context`);
        }
      } catch (error) {
        console.log('Could not fetch conversation history:', error);
      }
    }

    // Build messages array with conversation history
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      // Add recent conversation history
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    let finalResponse = '';
    let evaluation = null;

    if (usePromptChain) {
      // Implement prompt chain logic for quality improvement
      let currentResponse = '';
      let iterations = 0;
      let qualityScore = 0;

      const evaluationHistory = [];

      while (iterations < maxIterations && qualityScore < qualityThreshold) {
        iterations++;
        console.log(`Starting evaluation iteration ${iterations}`);

        // Generate response
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            messages: openAIMessages,
            temperature: temperature,
            max_tokens: maxTokens,
          }),
        });

        const responseData = await response.json();
        currentResponse = responseData.choices[0].message.content;

        // Evaluate response quality
        const evaluationResponse = await supabase.functions.invoke('evaluate-response', {
          body: {
            query: message,
            response: currentResponse,
            context: context,
            taskType: taskType
          }
        });

        if (evaluationResponse.data) {
          qualityScore = evaluationResponse.data.score;
          evaluationHistory.push({
            score: qualityScore,
            feedback: evaluationResponse.data.feedback
          });

          console.log(`Iteration ${iterations}: Response quality score = ${qualityScore}`);

          if (qualityScore >= qualityThreshold) {
            console.log('Response meets quality threshold!');
            break;
          } else if (iterations < maxIterations) {
            console.log('Response needs improvement, regenerating...');
            // Add feedback to improve next iteration
            openAIMessages.push({
              role: 'assistant',
              content: currentResponse
            });
            openAIMessages.push({
              role: 'user',
              content: `Please improve this response. Feedback: ${evaluationResponse.data.feedback}`
            });
          }
        } else {
          // If evaluation fails, use the response as is
          qualityScore = qualityThreshold;
          break;
        }
      }

      finalResponse = currentResponse;
      evaluation = {
        iterations,
        quality: qualityScore,
        evaluationHistory
      };
    } else {
      // Single response without evaluation
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: openAIMessages,
          temperature: temperature,
          max_tokens: maxTokens,
        }),
      });

      const responseData = await response.json();
      finalResponse = responseData.choices[0].message.content;
    }

    return new Response(JSON.stringify({
      message: finalResponse,
      threadId: threadId || crypto.randomUUID(),
      reasoning: enableMultiStepReasoning ? [
        {
          type: 'search',
          content: `Searched project content with ${ragResults.length} results found`
        },
        {
          type: 'context',
          content: `Built context from ${ragResults.length} documents and ${memories.length} memories`
        }
      ] : [],
      sources: ragResults.slice(0, 5).map((doc: any) => ({
        id: doc.id,
        content: doc.content.substring(0, 200) + '...',
        metadata: doc.metadata,
        similarity: doc.similarity,
        quality_score: doc.quality_score,
        weighted_score: doc.weighted_score,
        source_type: doc.source_type,
        source_info: doc.source_info
      })),
      confidence: hasRAGResults ? Math.min(95, 70 + (ragResults.length * 5)) : 60,
      evaluation: evaluation,
      contentTypeFilter: null,
      hasRAGResults: hasRAGResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in agent-chat function:', error);
    
    // Provide more helpful error messages based on error type
    let userMessage = "I'm sorry, I encountered an issue while processing your request.";
    
    if (error.message?.includes('API key')) {
      userMessage = "I'm experiencing authentication issues. Please try again in a moment.";
    } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      userMessage = "I'm currently experiencing high demand. Please try again in a few moments.";
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = "I'm having trouble connecting to my services. Please check your connection and try again.";
    } else if (error.message?.includes('timeout')) {
      userMessage = "Your request is taking longer than usual. Please try again, and consider breaking complex requests into smaller parts.";
    } else {
      userMessage = "I encountered an unexpected issue. Please try rephrasing your question or try again in a moment.";
    }
    
    return new Response(JSON.stringify({
      error: error.message,
      message: userMessage,
      suggestions: [
        "Try rephrasing your question",
        "Check your internet connection", 
        "Try again in a few moments",
        "Break complex requests into smaller parts"
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
