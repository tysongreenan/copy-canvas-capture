
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSource {
  content: string;
  similarity: number;
  metadata: {
    source: string;
    title?: string;
    type: string;
  };
}

export interface ChatResponse {
  response: string;
  sources?: ChatSource[];
}

export class ChatService {
  /**
   * Create a new conversation
   */
  public static async createConversation(projectId: string, title: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          project_id: projectId,
          title: title || 'New Conversation'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error creating conversation:", error);
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }
  
  /**
   * Get user's conversations for a project
   */
  public static async getConversations(projectId: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
      
      return data as ChatConversation[];
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }
  
  /**
   * Get messages for a conversation
   */
  public static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
      
      return data as ChatMessage[];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }
  
  /**
   * Send a message to the AI and get a response
   */
  public static async sendMessage(
    query: string, 
    projectId: string, 
    conversationId?: string,
    history?: ChatMessage[]
  ): Promise<{ response: ChatResponse; conversationId: string }> {
    try {
      let activeConversationId = conversationId;
      
      // If no conversation ID is provided, create a new one
      if (!activeConversationId) {
        activeConversationId = await this.createConversation(projectId, query.substring(0, 50));
        
        if (!activeConversationId) {
          throw new Error("Failed to create conversation");
        }
      }
      
      // Format history for the API if provided
      const formattedHistory = history?.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get response from AI
      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: {
          query,
          projectId,
          conversationId: activeConversationId,
          history: formattedHistory
        }
      });
      
      if (error) {
        console.error("Error sending message:", error);
        throw new Error(`Failed to get response: ${error.message}`);
      }
      
      return {
        response: data as ChatResponse,
        conversationId: activeConversationId
      };
    } catch (error: any) {
      console.error("Error in chat service:", error);
      throw new Error(`Chat error: ${error.message}`);
    }
  }
  
  /**
   * Delete a conversation
   */
  public static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) {
        console.error("Error deleting conversation:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  }
}
