
import { supabase } from '@/integrations/supabase/client';

// Define message type
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// Define conversation type
export interface ChatConversation {
  id: string;
  title: string;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Define API response type
export interface ChatApiResponse {
  response: string;
  conversationId: string;
  sources?: any[];
}

export class ChatService {
  // Get messages for a conversation with optional limit parameter
  static async getMessages(conversationId: string, limit: number = 20): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }
    
    return data as ChatMessage[];
  }

  static async getConversations(projectId: string): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }
    
    return data as ChatConversation[];
  }

  static async createConversation(projectId: string, title: string = "New Conversation"): Promise<string> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to create a conversation");
    }
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert([{ 
        project_id: projectId, 
        title: title,
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data.id;
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    // First delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) {
      throw new Error(`Error deleting conversation messages: ${messagesError.message}`);
    }
    
    // Then delete the conversation
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }
  }

  static async sendMessage(conversationId: string, role: string, content: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ conversation_id: conversationId, role: role, content: content }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }

    return data as ChatMessage;
  }
  
  // This method handles API communication for sending a message to the chat API
  static async sendMessageToAPI(content: string, projectId: string, conversationId?: string): Promise<ChatApiResponse> {
    // If no conversation ID is provided, create a new conversation
    if (!conversationId) {
      conversationId = await this.createConversation(projectId);
    }
    
    // Add the user message to the database
    await this.sendMessage(conversationId, 'user', content);
    
    // Call your API to get a response (this is a placeholder - implement your actual API call)
    // In a real implementation, you would call your backend API here
    const assistantResponse = "This is a placeholder response. Implement your actual API call here.";
    const sources = [];
    
    // Add the assistant response to the database
    await this.sendMessage(conversationId, 'assistant', assistantResponse);
    
    return {
      response: assistantResponse,
      conversationId: conversationId,
      sources: sources
    };
  }
}
