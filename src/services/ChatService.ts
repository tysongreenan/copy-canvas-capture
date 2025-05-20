import { supabase } from '@/integrations/supabase/client';

// Define message type
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export class ChatService {
  // Get messages for a conversation with optional limit parameter
  static async getMessages(conversationId: string, limit: number = 20): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }
    
    return data as ChatMessage[];
  }

  static async createConversation(projectId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ project_id: projectId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data.id;
  }

  static async sendMessage(conversationId: string, role: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, role: role, content: content }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }

    return data as ChatMessage;
  }
}
