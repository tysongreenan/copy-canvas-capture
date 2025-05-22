
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      qualityThreshold = 90
    } = await req.json();

    console.log(`Processing message for thread ${threadId}, project ${projectId}, task type ${taskType}`);
    console.log(`Using prompt chain: ${usePromptChain}, Max iterations: ${maxIterations}, Quality threshold: ${qualityThreshold}`);
    
    // Prepare system message based on task type
    let systemMessage = "You are a helpful AI assistant that specializes in content marketing and research.";
    
    if (taskType === 'email') {
      systemMessage = "You are an expert email writer who can craft professional, engaging, and effective emails.";
    } else if (taskType === 'summary') {
      systemMessage = "You are an expert at summarizing content. Create concise, accurate summaries that capture key points.";
    } else if (taskType === 'research') {
      systemMessage = "You are a research assistant with expertise in finding and analyzing information. Provide comprehensive research-based responses.";
    } else if (taskType === 'marketing') {
      systemMessage = "You are a marketing expert who specializes in content creation, strategy, and analysis. Provide creative, data-driven marketing insights.";
    } else if (taskType === 'content') {
      systemMessage = "You are a content creation specialist who can generate engaging and compelling content for various platforms and purposes.";
    }

    // Add memory context if available
    if (memories && memories.length > 0) {
      systemMessage += "\n\nHere are some relevant memories from previous conversations that might help with your response:";
      
      // Format memories in a helpful way
      memories.forEach((memory: any, index: number) => {
        systemMessage += `\n\nMemory ${index + 1}: ${memory.content}`;
      });
      
      systemMessage += "\n\nUse these memories when they're relevant to the user's query, but don't mention that you're using 'memories' in your response.";
    }

    // Add any content type filter instructions
    if (contentTypeFilter) {
      systemMessage += `\n\nFocus your responses specifically on content related to: ${contentTypeFilter}`;
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
              { role: "user", content: userMessage }
            ],
            temperature: temperature,
            max_tokens: maxTokens,
            tool_choice: "auto",
            tools: [
              {
                type: "function",
                function: {
                  name: "think_step_by_step",
                  description: "Think through a problem step by step to reach a conclusion or answer",
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
                            }
                          },
                          required: ["step_type", "content"]
                        },
                        description: "A series of reasoning steps showing your thought process"
                      },
                      final_answer: {
                        type: "string",
                        description: "The final answer or conclusion reached after reasoning"
                      },
                      confidence_score: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                        description: "A score from 0 to 1 indicating how confident you are in your answer"
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
              { role: "user", content: userMessage }
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
                context: memories
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
        
        evaluationHistory.forEach((eval, index) => {
          if (eval.score > highestScore) {
            highestScore = eval.score;
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
      contentTypeFilter: contentTypeFilter
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
