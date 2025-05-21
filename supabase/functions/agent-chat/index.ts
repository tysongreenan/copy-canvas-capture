
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define tool schemas
const contentSearchTool = {
  type: "function",
  function: {
    name: "searchContent",
    description: "Search for relevant content in the knowledge base based on a query",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant content"
        },
        contentTypeFilter: {
          type: "string",
          description: "Optional filter for specific content types",
          enum: ["webpage", "article", "product", "blog", "faq", "title", "meta_description", "headings", "paragraphs", "list_items"]
        }
      },
      required: ["query"]
    }
  }
};

const projectInfoTool = {
  type: "function",
  function: {
    name: "getProjectInfo",
    description: "Get information about the current project",
    parameters: {
      type: "object",
      properties: {
        infoType: {
          type: "string",
          description: "Type of project information to retrieve",
          enum: ["summary", "structure", "metadata"]
        }
      },
      required: ["infoType"]
    }
  }
};

const emailGenerationTool = {
  type: "function",
  function: {
    name: "generateEmailTemplate",
    description: "Generate a structured email template based on purpose and tone",
    parameters: {
      type: "object",
      properties: {
        purpose: {
          type: "string",
          description: "The purpose of the email (marketing, newsletter, sales, support, etc.)",
        },
        tone: {
          type: "string",
          description: "The tone of the email (formal, casual, friendly, professional)",
          enum: ["formal", "casual", "friendly", "professional", "urgent", "persuasive"]
        },
        audience: {
          type: "string",
          description: "The target audience for the email"
        },
        length: {
          type: "string",
          description: "The approximate length of the email",
          enum: ["short", "medium", "long"]
        }
      },
      required: ["purpose"]
    }
  }
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
    const { 
      message, 
      threadId, 
      projectId, 
      taskType = 'general',
      contentTypeFilter, 
      enableTools = true, 
      enableMultiStepReasoning = true,
      modelName = "gpt-4o-mini",
      temperature = 0.7,
      maxTokens = 1500
    } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message: "${message}"`);
    console.log(`Project ID: ${projectId || 'Not provided'}`);
    console.log(`Task type: ${taskType}`);
    console.log(`Content type filter: ${contentTypeFilter || 'None'}`);
    console.log(`Tools enabled: ${enableTools}`);
    console.log(`Multi-step reasoning: ${enableMultiStepReasoning}`);
    console.log(`Using model: ${modelName}`);
    console.log(`Temperature: ${temperature}`);
    console.log(`Max tokens: ${maxTokens}`);

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

    // Initialize array for tracking reasoning steps
    const reasoningSteps = [];
    let relevantContext = "";
    let sources = [];
    
    // Tool implementation: Content Search
    const searchContent = async (query: string, contentType: string | null = null) => {
      reasoningSteps.push({
        type: "tool_start",
        toolName: "searchContent",
        content: `Searching for content related to: "${query}"${contentType ? ` with content type filter: ${contentType}` : ''}`
      });

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
          match_count: 5,
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

        const result = {
          count: similarDocs?.length || 0,
          documents: similarDocs || []
        };

        reasoningSteps.push({
          type: "tool_result",
          toolName: "searchContent",
          content: `Found ${result.count} relevant documents`,
          toolOutput: result
        });

        // Save sources for inclusion in final response
        sources = similarDocs || [];

        return result;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "searchContent",
          content: `Error searching content: ${error.message}`
        });
        return { count: 0, documents: [], error: error.message };
      }
    };

    // Tool implementation: Project Info
    const getProjectInfo = async (infoType: string) => {
      reasoningSteps.push({
        type: "tool_start",
        toolName: "getProjectInfo",
        content: `Retrieving project information: ${infoType}`
      });

      try {
        // For now just return mock data - in a real implementation this would query project metadata
        let result = { type: infoType, data: {} };
        
        if (infoType === "summary") {
          result.data = {
            name: "Lumen Project",
            description: "An AI-powered content marketing platform",
            lastUpdated: new Date().toISOString()
          };
        } else if (infoType === "structure") {
          result.data = {
            contentTypes: ["webpage", "article", "blog", "faq"],
            sections: ["marketing", "product", "support"]
          };
        } else {
          result.data = {
            created: new Date().toISOString(),
            owner: "User",
            status: "Active"
          };
        }

        reasoningSteps.push({
          type: "tool_result",
          toolName: "getProjectInfo",
          content: `Retrieved project ${infoType} information`,
          toolOutput: result
        });
        
        return result;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "getProjectInfo",
          content: `Error getting project information: ${error.message}`
        });
        return { type: infoType, data: {}, error: error.message };
      }
    };

    // Tool implementation: Email Generation
    const generateEmailTemplate = async (params: any) => {
      const { purpose, tone = "professional", audience = "general", length = "medium" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "generateEmailTemplate",
        content: `Creating email template for purpose: ${purpose}, tone: ${tone}, audience: ${audience}, length: ${length}`
      });

      try {
        // This would typically be a more elaborate template generation system
        // For now we'll just return basic structure that the main AI can expand upon
        const template = {
          purpose,
          tone,
          audience,
          length,
          structure: {
            subject: `Subject line for ${purpose} email`,
            greeting: `Appropriate greeting for ${tone} email`,
            introduction: `Brief introduction paragraph explaining the purpose`,
            body: `Main content sections for a ${length} email about ${purpose}`,
            call_to_action: `Suggested call to action for ${purpose} email`,
            closing: `Appropriate closing for ${tone} email`,
            signature: `Email signature suggestion`
          }
        };
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "generateEmailTemplate",
          content: `Generated email template structure for ${purpose} email`,
          toolOutput: template
        });
        
        return template;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "generateEmailTemplate",
          content: `Error generating email template: ${error.message}`
        });
        return { error: error.message };
      }
    };

    // First phase: Perform RAG search using the content search tool
    if (projectId) {
      const searchResult = await searchContent(message, contentTypeFilter);
      if (searchResult.count > 0) {
        relevantContext = "Here's relevant information from the knowledge base:\n\n" + 
          searchResult.documents.map((doc: any, index: number) => 
            `[Document ${index + 1}]: ${doc.content}`
          ).join("\n\n");
      } else {
        relevantContext = "No relevant information was found in the knowledge base.";
      }

      // Add reasoning step for initial content analysis
      reasoningSteps.push({
        type: "reasoning",
        content: "Analyzed the retrieved content for relevance to the user query"
      });
    }

    // Second phase: Enable multi-step reasoning and function calling
    let tools = [];
    if (enableTools) {
      tools = [contentSearchTool, projectInfoTool];
      
      // Add email-specific tools for email-related tasks
      if (taskType === 'email' || message.toLowerCase().includes('email')) {
        tools.push(emailGenerationTool);
      }
    }
    
    // Structure the system message based on enabled features and task type
    let systemMessage = `You are an intelligent assistant for the Lumen platform, specialized in marketing research and content analysis.
    You provide thoughtful, well-reasoned responses based on the user's query and any relevant information from their content.
    
    When answering:
    1. Use the provided relevant information when available
    2. Cite your sources when providing information
    3. Be honest when you don't know something
    4. Organize your responses clearly
    5. Provide actionable insights when possible`;

    // Add task-specific instructions
    if (taskType === 'email') {
      systemMessage += `\n\nYou are currently focusing on email creation. When generating email content:
      1. Create clear, concise, and engaging email copy
      2. Structure emails with appropriate sections (subject line, greeting, body, call to action, closing)
      3. Adjust tone and style based on the purpose (marketing, outreach, newsletter, etc.)
      4. Use language that resonates with the target audience
      5. Suggest effective subject lines that will improve open rates`;
    }

    if (enableMultiStepReasoning) {
      systemMessage += `\n\nImportant: Think step-by-step to solve complex questions. Before providing a final answer:
      1. Break down the question into smaller parts
      2. Consider what information you need to answer each part
      3. Use available tools to gather necessary information
      4. Analyze the collected information
      5. Synthesize all insights into a coherent response`;
    }

    // Send the request to OpenAI with system instructions, function calling, and relevant context
    const openaiRequestBody: any = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: relevantContext ? `${relevantContext}\n\nUser question: ${message}` : message
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    };

    if (tools.length > 0) {
      openaiRequestBody.tools = tools;
      openaiRequestBody.tool_choice = "auto";
    }

    // Log the complete request for debugging purposes
    console.log("Sending request to OpenAI");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    
    // Process the response and handle any tool calls
    let finalResponse = aiResponse.choices[0].message.content;
    let toolCalls = aiResponse.choices[0].message.tool_calls || [];
    
    // If there are tool calls, execute them
    if (toolCalls && toolCalls.length > 0) {
      reasoningSteps.push({
        type: "planning",
        content: "AI determined it needs additional information and will use tools to gather it"
      });
      
      // Process each tool call
      for (const call of toolCalls) {
        const { function: fn } = call;
        const { name, arguments: args } = fn;
        
        const parsedArgs = JSON.parse(args);
        
        if (name === "searchContent") {
          await searchContent(parsedArgs.query, parsedArgs.contentTypeFilter);
        }
        else if (name === "getProjectInfo") {
          await getProjectInfo(parsedArgs.infoType);
        }
        else if (name === "generateEmailTemplate") {
          await generateEmailTemplate(parsedArgs);
        }
      }
      
      // Make a follow-up call to OpenAI with the tool results
      const messagesWithToolResults = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: relevantContext ? `${relevantContext}\n\nUser question: ${message}` : message
        },
        aiResponse.choices[0].message,
        {
          role: 'system',
          content: `Based on the tool results provided, please synthesize a final response to the user's question. Include specific references to content when relevant.`
        }
      ];
      
      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: messagesWithToolResults,
          temperature: temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!followUpResponse.ok) {
        const errorData = await followUpResponse.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const synthesizedResponse = await followUpResponse.json();
      finalResponse = synthesizedResponse.choices[0].message.content;
      
      // Add final reasoning step
      reasoningSteps.push({
        type: "synthesis",
        content: "Synthesized all gathered information to provide a comprehensive response"
      });
    }
    
    // Final phase: Record our confidence in the response
    const confidenceScore = sources.length > 0 ? 0.8 : 0.5;
    reasoningSteps.push({
      type: "evaluation",
      content: `Response confidence: ${confidenceScore.toFixed(2)}. ${sources.length > 0 ? 
        'Based on multiple relevant sources.' : 
        'Limited source material available for this response.'}`
    });

    console.log("Successfully generated AI response");

    // Include metadata in response
    return new Response(
      JSON.stringify({
        message: finalResponse,
        threadId: currentThreadId,
        reasoning: reasoningSteps,
        contentTypeFilter: contentTypeFilter || null,
        sources: sources,
        confidence: confidenceScore
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
