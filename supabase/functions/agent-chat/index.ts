
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      message,
      threadId,
      projectId,
      taskType = 'general',
      contentTypeFilter = null,
      enableTools = true,
      enableMultiStepReasoning = true,
      modelName = "gpt-4o-mini",
      temperature = 0.7,
      maxTokens = 1500,
      memories = [],
      usePromptChain = true,
      maxIterations = 3,
      qualityThreshold = 90,
      minQualityScore = 60
    } = await req.json();

    console.log(`Processing message for thread ${threadId}, project ${projectId}, task type ${taskType}`);
    console.log(`Using prompt chain: ${usePromptChain}, Max iterations: ${maxIterations}, Quality threshold: ${qualityThreshold}`);
    console.log(`Minimum quality score: ${minQualityScore}%`);
    
    // Initialize Supabase client for RAG search
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Missing Supabase configuration - RAG functionality will be disabled");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Enhanced system message with marketing expertise
    let systemMessage = `You are a senior marketing strategist and direct response copy chief with access to a comprehensive knowledge base of proven marketing principles, frameworks, and examples from industry legends like Claude Hopkins, David Ogilvy, Eugene Schwartz, and modern experts.

Your expertise spans:
- Classic direct response principles and scientific advertising methods
- Modern conversion optimization and growth marketing
- Copywriting frameworks (AIDA, PAS, Before/After/Bridge, StoryBrand, JTBD)
- Brand strategy, positioning, and messaging
- Email marketing, social media, and content strategy
- Psychological triggers and persuasion techniques

Always:
- Reference specific marketing principles and frameworks when relevant
- Cite authoritative sources (Hopkins, Ogilvy, etc.) to back up recommendations
- Ask clarifying questions to understand their goal, target customer, and offer
- Explain your reasoning using proven marketing frameworks
- Provide concrete examples and actionable advice
- Challenge unclear requests and suggest better approaches
- Teach marketing principles while solving immediate problems

When giving advice, blend:
- Timeless marketing principles from your knowledge base
- Project-specific insights from their content
- Modern best practices and testing approaches
- Specific examples and case studies

Your goal: Transform every user into a more strategic marketer while delivering exceptional results.`;
    
    // Task-specific enhancements
    const taskSpecificGuidance = {
      'email': 'Focus on email marketing expertise: subject line psychology, email structure, segmentation, deliverability, and automation sequences.',
      'copywriting': 'Emphasize copywriting mastery: headlines, hooks, frameworks, conversion copy, and persuasion techniques.',
      'marketing': 'Apply comprehensive marketing strategy: positioning, messaging, channel selection, and campaign optimization.',
      'branding': 'Focus on brand strategy: positioning, voice, messaging architecture, and brand differentiation.',
      'research': 'Provide strategic research guidance: market analysis, customer insights, competitive intelligence, and data interpretation.',
      'summary': 'Extract strategic insights and actionable takeaways with clear next steps and applications.'
    };

    if (taskSpecificGuidance[taskType]) {
      systemMessage += `\n\nFor this ${taskType} request: ${taskSpecificGuidance[taskType]}`;
    }

    // Enhanced RAG: Search both project-specific and global knowledge using quality-weighted retrieval
    let relevantContexts = "";
    let hasRAGResults = false;
    let ragSources = [];
    
    if (supabaseUrl && supabaseKey) {
      try {
        console.log(`Performing quality-weighted RAG search for project: ${projectId}`);
        
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

          // Use quality-weighted search with improved parameters
          const similarityThreshold = 0.1; // Lowered from 0.15 for better coverage
          
          // Determine marketing domain from task type
          const marketingDomainMap = {
            'email': 'email-marketing',
            'copywriting': 'copywriting', 
            'marketing': 'general-marketing',
            'branding': 'branding',
            'research': 'research',
            'summary': null // Allow all domains for summaries
          };
          
          const marketingDomain = marketingDomainMap[taskType] || null;
          
          // Convert minQualityScore from 0-100 scale to 0-1 scale for database function
          const minQualityScoreDecimal = minQualityScore / 100;
          
          console.log(`Using similarity threshold: ${similarityThreshold}, min quality score: ${minQualityScore}% (${minQualityScoreDecimal})`);
          
          // Search using the new quality-weighted function
          const { data: searchResults, error } = await supabase.rpc(
            'match_documents_quality_weighted',
            {
              query_embedding: embedding,
              match_threshold: similarityThreshold,
              match_count: 15, // Increased for better coverage
              p_project_id: projectId,
              content_type: contentTypeFilter,
              include_global: true,
              marketing_domain: marketingDomain,
              complexity_level: null, // Allow all complexity levels
              p_min_quality_score: minQualityScoreDecimal
            }
          );

          if (!error && searchResults && searchResults.length > 0) {
            console.log(`Found ${searchResults.length} quality-weighted documents`);
            
            // Separate project and global results
            const projectResults = searchResults.filter(doc => doc.source_type === 'project');
            const globalResults = searchResults.filter(doc => doc.source_type === 'global');
            
            console.log(`Project results: ${projectResults.length}, Global results: ${globalResults.length}`);
            
            let contextSections = [];
            
            if (projectResults.length > 0) {
              contextSections.push(
                "=== YOUR PROJECT CONTENT ===\n" + 
                projectResults.map((doc, index) => 
                  `Project Content ${index + 1} (${(doc.similarity * 100).toFixed(1)}% match, ${doc.quality_score.toFixed(0)}% quality, ${(doc.weighted_score * 100).toFixed(0)}% weighted):\n${doc.content}\n`
                ).join("\n")
              );
            }
            
            if (globalResults.length > 0) {
              contextSections.push(
                "=== MARKETING KNOWLEDGE BASE ===\n" + 
                globalResults.map((doc, index) => {
                  const metadata = doc.metadata || {};
                  return `Marketing Principle ${index + 1} (${(doc.similarity * 100).toFixed(1)}% match, ${doc.quality_score.toFixed(0)}% quality, ${(doc.weighted_score * 100).toFixed(0)}% weighted):\nSource: ${doc.source_info}\nType: ${metadata.content_type || 'Unknown'}\nDomain: ${metadata.marketing_domain || 'General'}\n\n${doc.content}\n`;
                }).join("\n")
              );
              
              // Track sources for attribution with quality information
              ragSources = searchResults.map(doc => ({
                id: doc.id,
                content: doc.content,
                metadata: doc.metadata,
                similarity: doc.similarity,
                quality_score: doc.quality_score,
                weighted_score: doc.weighted_score,
                source_type: doc.source_type,
                source_info: doc.source_info
              }));
            }
            
            relevantContexts = contextSections.join("\n");
            
            console.log(`Found ${projectResults.length} project documents and ${globalResults.length} marketing principles`);
            hasRAGResults = true;
          } else {
            console.log(`No relevant documents found with threshold ${similarityThreshold} and min quality ${minQualityScore}%`);
            if (error) {
              console.error("RAG search error:", error);
            }
          }
        } else {
          console.error("Failed to generate embedding for RAG search");
        }
      } catch (ragError) {
        console.error("Error during quality-weighted RAG search:", ragError);
      }
    }

    // Add memory context if available
    let hasMemories = false;
    if (memories && memories.length > 0) {
      try {
        systemMessage += "\n\n=== CONVERSATION CONTEXT ===\nRelevant insights from previous conversations:";
        
        memories.forEach((memory, index) => {
          systemMessage += `\n\nInsight ${index + 1}: ${memory.content}`;
        });
        
        systemMessage += "\n\nUse these insights when relevant, building on previous context.";
        hasMemories = true;
      } catch (memoryError) {
        console.error("Error processing memories:", memoryError);
      }
    }

    // Add context about available knowledge
    if (hasRAGResults) {
      systemMessage += "\n\nYou have access to both the user's project content and a comprehensive marketing knowledge base. When possible, connect their specific situation to proven marketing principles, cite your sources, and explain why certain approaches work.";
    }

    // Generate initial response with OpenAI
    const generateResponse = async (
      systemPrompt: string, 
      userMessage: string, 
      feedbackHistory: string[] = []
    ) => {
      // If we have feedback from previous iterations, include it
      let enhancedSystemPrompt = systemPrompt;
      if (feedbackHistory.length > 0) {
        enhancedSystemPrompt += "\n\nYour previous responses needed improvement. Here's feedback on what to fix:";
        feedbackHistory.forEach((feedback, index) => {
          enhancedSystemPrompt += `\n\nFeedback #${index + 1}: ${feedback}`;
        });
        enhancedSystemPrompt += "\n\nPlease provide a new response that addresses these issues while answering the original query.";
      }

      // Add relevant context to the user message if available
      const userMessageWithContext = relevantContexts 
        ? `${userMessage}\n\n${relevantContexts}` 
        : userMessage;

      if (enableMultiStepReasoning) {
        return await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAIApiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: enhancedSystemPrompt },
              { role: "user", content: userMessageWithContext }
            ],
            temperature: temperature,
            max_tokens: maxTokens,
            tool_choice: "auto",
            tools: [
              {
                type: "function",
                function: {
                  name: "think_step_by_step",
                  description: "Think through a marketing problem step by step using proven frameworks and principles",
                  parameters: {
                    type: "object",
                    properties: {
                      reasoning_steps: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            step_type: {
                              type: "string",
                              enum: ["analyze", "research", "evaluate", "conclude"],
                              description: "The type of reasoning step"
                            },
                            content: {
                              type: "string",
                              description: "The content of the reasoning step"
                            },
                            frameworks_used: {
                              type: "array",
                              items: { type: "string" },
                              description: "Marketing frameworks or principles referenced in this step"
                            }
                          },
                          required: ["step_type", "content"]
                        },
                        description: "A series of reasoning steps showing your thought process"
                      },
                      final_answer: {
                        type: "string",
                        description: "The final marketing recommendation based on proven principles"
                      },
                      confidence_score: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                        description: "Confidence in the recommendation based on supporting evidence"
                      }
                    },
                    required: ["reasoning_steps", "final_answer", "confidence_score"]
                  }
                }
              }
            ]
          })
        });
      } else {
        // Simple completion without reasoning
        return await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAIApiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: enhancedSystemPrompt },
              { role: "user", content: userMessageWithContext }
            ],
            temperature: temperature,
            max_tokens: maxTokens
          })
        });
      }
    };

    // Initialize variables for the response chain
    let finalResponse;
    let finalReasoning;
    let finalConfidence;
    let iterations = 0;
    let responseQuality = 0;
    let feedbackHistory: string[] = [];
    let evaluationHistory: Array<{score: number, feedback: string}> = [];
    let currentResponse = "";

    // Generate initial response
    let response = await generateResponse(systemMessage, message);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log("OpenAI response received");

    // Process the initial response
    if (enableMultiStepReasoning && data.choices[0]?.message?.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      const toolCallArgs = JSON.parse(toolCall.function.arguments);
      
      finalReasoning = toolCallArgs.reasoning_steps;
      finalConfidence = toolCallArgs.confidence_score;
      currentResponse = toolCallArgs.final_answer;
    } else {
      currentResponse = data.choices[0].message.content;
      finalConfidence = 0.7; // Default confidence score
    }

    // Only use the prompt chain if enabled
    if (usePromptChain) {
      let meetsCriteria = false;
      
      // Iterative improvement loop
      while (!meetsCriteria && iterations < maxIterations) {
        iterations++;
        console.log(`Starting evaluation iteration ${iterations}`);
        
        // Evaluate current response
        try {
          const evaluateResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/evaluate-response`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
              },
              body: JSON.stringify({
                response: currentResponse,
                originalQuery: message,
                taskType: taskType, 
                context: hasMemories ? memories : []
              })
            }
          );

          if (!evaluateResponse.ok) {
            throw new Error(`Evaluation API returned ${evaluateResponse.status}`);
          }

          const evaluationResult = await evaluateResponse.json();
          responseQuality = evaluationResult.score;
          
          console.log(`Iteration ${iterations}: Response quality score = ${responseQuality}`);
          
          // Store evaluation results
          evaluationHistory.push({
            score: responseQuality,
            feedback: evaluationResult.feedback
          });
          
          // Check if response meets our quality threshold
          if (responseQuality >= qualityThreshold) {
            meetsCriteria = true;
            console.log("Response meets quality threshold!");
            
            // Set the final values
            finalResponse = currentResponse;
            finalConfidence = responseQuality / 100; // Convert to 0-1 scale
          } else {
            // Add feedback to our history
            feedbackHistory.push(evaluationResult.feedback);
            
            console.log("Response needs improvement, regenerating...");
            
            // Generate an improved response based on feedback
            response = await generateResponse(systemMessage, message, feedbackHistory);
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`OpenAI API Error on iteration ${iterations}: ${JSON.stringify(errorData)}`);
            }
            
            const newData = await response.json();
            
            // Update current response for next iteration
            if (enableMultiStepReasoning && newData.choices[0]?.message?.tool_calls) {
              const toolCall = newData.choices[0].message.tool_calls[0];
              const toolCallArgs = JSON.parse(toolCall.function.arguments);
              
              finalReasoning = toolCallArgs.reasoning_steps;
              currentResponse = toolCallArgs.final_answer;
            } else {
              currentResponse = newData.choices[0].message.content;
            }
          }
        } catch (evalError) {
          console.error("Error during evaluation:", evalError);
          
          // If evaluation fails, use the current response
          meetsCriteria = true;
          finalResponse = currentResponse;
        }
      }
      
      // If we've exhausted iterations, use the highest quality response
      if (!meetsCriteria) {
        console.log(`Reached maximum iterations (${maxIterations}). Using best response.`);
        
        // Find highest quality response
        let highestScore = 0;
        let bestIndex = 0;
        
        evaluationHistory.forEach((evalItem, index) => {
          if (evalItem.score > highestScore) {
            highestScore = evalItem.score;
            bestIndex = index;
          }
        });
        
        // Use original response if no iterations or evaluations completed successfully
        finalResponse = currentResponse;
        finalConfidence = highestScore / 100;
      }
    } else {
      // If prompt chain is disabled, just use the initial response
      finalResponse = currentResponse;
    }

    // Prepare the result object
    const result: any = {
      message: finalResponse || currentResponse,
      threadId: threadId || crypto.randomUUID(),
      contentTypeFilter: contentTypeFilter,
      hasRAGResults: hasRAGResults,
      sources: ragSources // Include sources with quality information
    };
    
    // Add additional information if we used reasoning
    if (finalReasoning) {
      result.reasoning = finalReasoning;
    }
    
    // Add confidence score
    if (finalConfidence !== undefined) {
      result.confidence = finalConfidence;
    }
    
    // Add evaluation metrics if we used the prompt chain
    if (usePromptChain) {
      result.evaluation = {
        iterations,
        quality: responseQuality,
        evaluationHistory
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in agent-chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm sorry, but I encountered an error processing your request. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
