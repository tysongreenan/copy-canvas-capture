
import { supabase } from "@/integrations/supabase/client";
import { AgentService } from "./AgentService";

export interface Memory {
  id: string;
  content: string;
  similarity?: number;
}

export class MemoryService {
  /**
   * Store a new memory for a specific user and project
   */
  public static async storeMemory(
    userId: string,
    projectId: string,
    content: string
  ): Promise<string | null> {
    try {
      // Generate embedding for the memory content
      const embeddingData = await this.generateEmbedding(content);
      
      if (!embeddingData) {
        console.error("Failed to generate embedding for memory");
        return null;
      }

      // Insert the memory with its embedding
      const { data, error } = await supabase
        .from('agent_memories')
        .insert({
          user_id: userId,
          project_id: projectId,
          content: content,
          embedding: embeddingData,
          importance_score: 0.7, // Default importance score
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error storing memory:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Exception in storeMemory:", error);
      return null;
    }
  }

  /**
   * Retrieve relevant memories for a specific user, project, and query
   */
  public static async getRelevantMemories(
    userId: string,
    projectId: string, 
    query: string,
    limit: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<Memory[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      if (!queryEmbedding) {
        console.error("Failed to generate embedding for query");
        return [];
      }

      // Search for similar memories using the database function
      const { data, error } = await supabase.rpc(
        'search_agent_memories',
        {
          query_embedding: queryEmbedding,
          similarity_threshold: similarityThreshold,
          max_results: limit,
          p_user_id: userId,
          p_project_id: projectId
        }
      );

      if (error) {
        console.error("Error retrieving memories:", error);
        return [];
      }

      // Update the last accessed timestamp for the retrieved memories
      if (data && data.length > 0) {
        const memoryIds = data.map(memory => memory.id);
        await supabase
          .from('agent_memories')
          .update({ last_accessed_at: new Date().toISOString() })
          .in('id', memoryIds);
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getRelevantMemories:", error);
      return [];
    }
  }

  /**
   * Store a conversation summary
   */
  public static async storeConversationSummary(
    userId: string,
    projectId: string,
    conversationId: string,
    summary: string
  ): Promise<string | null> {
    try {
      // Insert the summary
      const { data, error } = await supabase
        .from('conversation_summaries')
        .insert({
          user_id: userId,
          project_id: projectId,
          conversation_id: conversationId,
          summary: summary
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error storing conversation summary:", error);
        return null;
      }

      // Also store this as a memory
      await this.storeMemory(userId, projectId, summary);

      return data.id;
    } catch (error) {
      console.error("Exception in storeConversationSummary:", error);
      return null;
    }
  }

  /**
   * Get a conversation summary if it exists
   */
  public static async getConversationSummary(conversationId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_summaries')
        .select('summary')
        .eq('conversation_id', conversationId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.summary;
    } catch (error) {
      console.error("Exception in getConversationSummary:", error);
      return null;
    }
  }

  /**
   * Generate embedding for text using the Supabase edge function
   */
  private static async generateEmbedding(text: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });
      
      if (error) {
        console.error("Error generating embedding:", error);
        return null;
      }
      
      return data.embedding;
    } catch (error) {
      console.error("Exception in generateEmbedding:", error);
      return null;
    }
  }

  /**
   * Generate a summary for a conversation
   */
  public static async summarizeConversation(messages: any[]): Promise<string> {
    try {
      // Filter out system messages and format for summarization
      const formattedMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Use the OpenAI API via edge function to generate a summary
      const { data, error } = await supabase.functions.invoke("summarize-conversation", {
        body: {
          conversation: formattedMessages
        }
      });

      if (error) {
        console.error("Error summarizing conversation:", error);
        return "Failed to generate conversation summary.";
      }

      return data.summary;
    } catch (error) {
      console.error("Exception in summarizeConversation:", error);
      return "Failed to generate conversation summary due to an error.";
    }
  }
}
