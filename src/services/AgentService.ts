
import { supabase } from "@/integrations/supabase/client";

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentTool {
  type: string;
  name: string;
  description: string;
  parameters?: any;
}

export interface AgentStep {
  type: string;
  content: string;
  toolName?: string;
  toolOutput?: any;
}

export interface AgentSource {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
}

export interface AgentResponse {
  message: string;
  threadId: string;
  reasoning?: AgentStep[];
  contentTypeFilter?: string | null;
  sources?: AgentSource[];
  confidence?: number;
}

export type AgentTaskType = 'general' | 'email' | 'summary' | 'research' | 'marketing' | 'content';

export interface AgentRequestOptions {
  taskType?: AgentTaskType;
  contentTypeFilter?: string | null;
  enableTools?: boolean;
  enableMultiStepReasoning?: boolean;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AgentService {
  /**
   * Send a message to the AI agent and get a response with reasoning steps
   */
  public static async sendMessage(
    message: string, 
    threadId?: string,
    projectId?: string,
    options: AgentRequestOptions = {}
  ): Promise<AgentResponse> {
    try {
      console.log(`Sending agent message. Thread ID: ${threadId}, Project ID: ${projectId}`);
      
      // Merge default options with provided options
      const defaultOptions: AgentRequestOptions = {
        taskType: 'general',
        contentTypeFilter: null,
        enableTools: true,
        enableMultiStepReasoning: true,
        modelName: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 1500,
      };

      // Special cases for different task types
      if (options.taskType === 'email') {
        defaultOptions.temperature = 0.5; // Lower temperature for more consistent email generation
        defaultOptions.maxTokens = 2000; // More tokens for emails
      } else if (options.taskType === 'summary') {
        defaultOptions.temperature = 0.3; // Even lower temperature for summaries
        defaultOptions.maxTokens = 1800; // More tokens for comprehensive summaries
      } else if (options.taskType === 'research') {
        defaultOptions.modelName = "gpt-4o"; // Use more powerful model for research
        defaultOptions.enableTools = true; // Ensure tools are enabled for research
        defaultOptions.temperature = 0.4; // Lower temperature for more factual responses
      } else if (options.taskType === 'marketing' || options.taskType === 'content') {
        defaultOptions.modelName = "gpt-4o"; // Use more powerful model for marketing
        defaultOptions.enableTools = true; // Ensure tools are enabled for marketing
        defaultOptions.temperature = 0.6; // Balanced temperature for creative yet factual content
        defaultOptions.maxTokens = 2000; // More tokens for comprehensive marketing guidance
      }
      
      // Merge with user options, with user options taking precedence
      const finalOptions = { ...defaultOptions, ...options };
      
      console.log(`Agent options: Task Type: ${finalOptions.taskType}, Model: ${finalOptions.modelName}`);

      // Call the Supabase edge function that handles agent communication
      const { data, error } = await supabase.functions.invoke("agent-chat", {
        body: {
          message,
          threadId,
          projectId,
          taskType: finalOptions.taskType,
          contentTypeFilter: finalOptions.contentTypeFilter,
          enableTools: finalOptions.enableTools,
          enableMultiStepReasoning: finalOptions.enableMultiStepReasoning,
          modelName: finalOptions.modelName,
          temperature: finalOptions.temperature,
          maxTokens: finalOptions.maxTokens
        }
      });
      
      if (error) {
        console.error("Error sending message to agent:", error);
        throw new Error(`Failed to get response from agent: ${error.message}`);
      }
      
      console.log("Agent response received:", data);
      return data as AgentResponse;
    } catch (error: any) {
      console.error("Error in agent service:", error);
      throw new Error(`Agent error: ${error.message}`);
    }
  }
}
