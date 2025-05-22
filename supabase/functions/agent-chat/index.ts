
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
      memories = []
    } = await req.json();

    console.log(`Processing message for thread ${threadId}, project ${projectId}, task type ${taskType}`);
    
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

    // Call OpenAI API based on whether reasoning is enabled or not
    let response;
    
    if (enableMultiStepReasoning) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: message }
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
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: message }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");
    
    // Process the response differently based on whether reasoning was enabled
    let result;
    
    if (enableMultiStepReasoning && data.choices[0]?.message?.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      const toolCallArgs = JSON.parse(toolCall.function.arguments);
      
      result = {
        message: toolCallArgs.final_answer,
        threadId: threadId || crypto.randomUUID(),
        reasoning: toolCallArgs.reasoning_steps,
        confidence: toolCallArgs.confidence_score,
        contentTypeFilter: contentTypeFilter
      };
    } else {
      // Simple response without reasoning
      result = {
        message: data.choices[0].message.content,
        threadId: threadId || crypto.randomUUID(),
        contentTypeFilter: contentTypeFilter
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
