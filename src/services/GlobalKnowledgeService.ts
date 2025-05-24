
import { supabase } from "@/integrations/supabase/client";

export interface GlobalKnowledge {
  id: string;
  content: string;
  title?: string;
  source: string;
  content_type: string;
  marketing_domain: string;
  complexity_level: string;
  tags: string[];
  metadata: any;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  author?: string;
  source_type: string;
  url?: string;
  description?: string;
  authority_score: number;
  last_processed_at?: string;
  created_at: string;
}

export class GlobalKnowledgeService {
  /**
   * Add a new piece of knowledge to the global knowledge base
   */
  public static async addKnowledge(
    content: string,
    title: string,
    source: string,
    contentType: string,
    marketingDomain: string,
    complexityLevel: string = 'beginner',
    tags: string[] = [],
    metadata: any = {}
  ): Promise<string | null> {
    try {
      // Generate embedding for the content
      const embeddingData = await this.generateEmbedding(content);
      
      if (!embeddingData) {
        console.error("Failed to generate embedding for knowledge content");
        return null;
      }

      // Insert the knowledge with its embedding
      const { data, error } = await supabase
        .from('global_knowledge')
        .insert({
          content,
          title,
          source,
          content_type: contentType,
          marketing_domain: marketingDomain,
          complexity_level: complexityLevel,
          tags,
          metadata,
          embedding: embeddingData
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error storing global knowledge:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Exception in addKnowledge:", error);
      return null;
    }
  }

  /**
   * Add a new knowledge source
   */
  public static async addKnowledgeSource(
    name: string,
    sourceType: string,
    author?: string,
    url?: string,
    description?: string,
    authorityScore: number = 0.5
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .insert({
          name,
          author,
          source_type: sourceType,
          url,
          description,
          authority_score: authorityScore
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error storing knowledge source:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Exception in addKnowledgeSource:", error);
      return null;
    }
  }

  /**
   * Get all knowledge sources
   */
  public static async getKnowledgeSources(): Promise<KnowledgeSource[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .select('*')
        .order('authority_score', { ascending: false });

      if (error) {
        console.error("Error fetching knowledge sources:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getKnowledgeSources:", error);
      return [];
    }
  }

  /**
   * Search global knowledge by content type and domain
   */
  public static async searchKnowledge(
    contentType?: string,
    marketingDomain?: string,
    complexityLevel?: string,
    tags?: string[]
  ): Promise<GlobalKnowledge[]> {
    try {
      let query = supabase
        .from('global_knowledge')
        .select('*');

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      if (marketingDomain) {
        query = query.eq('marketing_domain', marketingDomain);
      }

      if (complexityLevel) {
        query = query.eq('complexity_level', complexityLevel);
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      const { data, error } = await query
        .order('quality_score', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error searching global knowledge:", error);
        return [];
      }

      // Transform the database result to match our interface
      const transformedData: GlobalKnowledge[] = (data || []).map(item => ({
        id: item.id,
        content: item.content,
        title: item.title,
        source: item.source,
        content_type: item.content_type,
        marketing_domain: item.marketing_domain,
        complexity_level: item.complexity_level,
        tags: Array.isArray(item.tags) ? item.tags as string[] : [],
        metadata: item.metadata,
        quality_score: item.quality_score,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return transformedData;
    } catch (error) {
      console.error("Exception in searchKnowledge:", error);
      return [];
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
}
