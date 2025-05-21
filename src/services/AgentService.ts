
import { supabase } from "@/integrations/supabase/client";

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentStep {
  type: string;
  content: string;
}

export interface AgentResponse {
  message: string;
  threadId: string;
  reasoning?: AgentStep[];
  contentTypeFilter?: string | null;
}

export class AgentService {
  /**
   * Send a message to the OpenAI agent and get a response with reasoning steps
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
          contentTypeFilter
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
