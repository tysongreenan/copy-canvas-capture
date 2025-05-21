
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

export class AgentService {
  /**
   * Send a message to the AI agent and get a response with reasoning steps
   */
  public static async sendMessage(
    message: string, 
    threadId?: string,
    projectId?: string,
    contentTypeFilter?: string | null
  ): Promise<AgentResponse> {
    try {
      // Call the Supabase edge function that handles agent communication
      const { data, error } = await supabase.functions.invoke("agent-chat", {
        body: {
          message,
          threadId,
          projectId,
          contentTypeFilter,
          enableTools: true, // Enable the use of tools for enhanced reasoning
          enableMultiStepReasoning: true, // Allow multi-step reasoning process
          modelName: "gpt-4o" // Use a more powerful model for complex reasoning
        }
      });
      
      if (error) {
        console.error("Error sending message to agent:", error);
        throw new Error(`Failed to get response from agent: ${error.message}`);
      }
      
      return data as AgentResponse;
    } catch (error: any) {
      console.error("Error in agent service:", error);
      throw new Error(`Agent error: ${error.message}`);
    }
  }
}
