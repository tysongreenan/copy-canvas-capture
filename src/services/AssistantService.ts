
import { supabase } from "@/integrations/supabase/client";

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantResponse {
  message: string;
  threadId: string;
}

export class AssistantService {
  /**
   * Send a message to the OpenAI assistant and get a response
   */
  public static async sendMessage(
    message: string, 
    threadId?: string,
    assistantId: string = "asst_hLaKt8VKignxoY0V0NyZxGWO", // Marketing Research assistant by default
    projectId?: string
  ): Promise<AssistantResponse> {
    try {
      // Call the Supabase edge function that handles assistant communication
      const { data, error } = await supabase.functions.invoke("assistant-chat", {
        body: {
          message,
          threadId,
          assistantId,
          projectId,
          useFineTunedModel: assistantId === "asst_hLaKt8VKignxoY0V0NyZxGWO" // Only use fine-tuned model for Marketing Research
        }
      });
      
      if (error) {
        console.error("Error sending message to assistant:", error);
        throw new Error(`Failed to get response from assistant: ${error.message}`);
      }
      
      return data as AssistantResponse;
    } catch (error: any) {
      console.error("Error in assistant service:", error);
      throw new Error(`Assistant error: ${error.message}`);
    }
  }
  
  /**
   * Get the assistant ID based on assistant type
   */
  public static getAssistantId(type: string): string {
    // Map assistant types to their IDs
    // For now we only have one assistant, but this allows for easy expansion
    const assistantMap: Record<string, string> = {
      "Marketing Research": "asst_hLaKt8VKignxoY0V0NyZxGWO",
      "Content Writer": "asst_hLaKt8VKignxoY0V0NyZxGWO", // Using the same assistant for now
      "SEO Specialist": "asst_hLaKt8VKignxoY0V0NyZxGWO", // Using the same assistant for now
      "Brand Strategist": "asst_hLaKt8VKignxoY0V0NyZxGWO", // Using the same assistant for now
      "General Assistant": "asst_hLaKt8VKignxoY0V0NyZxGWO", // Using the same assistant for now
    };
    
    return assistantMap[type] || "asst_hLaKt8VKignxoY0V0NyZxGWO"; // Default to Marketing Research
  }
}
