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

export interface QualityAssessment {
  clarity: number;
  accuracy: number;
  relevance: number;
  completeness: number;
  marketing_value: number;
  overall_score: number;
  reasoning: string;
}

export class GlobalKnowledgeService {
  /**
   * Add a new piece of knowledge to the global knowledge base with AI quality assessment
   */
  public static async addKnowledge(
    content: string,
    title: string,
    source: string,
    contentType: string,
    marketingDomain: string,
    complexityLevel: string = 'beginner',
    tags: string[] = [],
    metadata: any = {},
    useAIAssessment: boolean = true
  ): Promise<string | null> {
    try {
      console.log("Starting knowledge addition process...");
      
      // Step 1: Generate AI quality assessment if enabled
      let qualityScore = 0.8; // Default fallback
      let qualityAssessment: QualityAssessment | null = null;
      
      if (useAIAssessment && content.length > 50) {
        try {
          console.log("Generating AI quality assessment...");
          qualityAssessment = await this.assessContentQuality(content, contentType, marketingDomain);
          qualityScore = qualityAssessment.overall_score;
          console.log("AI quality assessment completed:", qualityAssessment);
        } catch (assessmentError) {
          console.warn("AI quality assessment failed, using default score:", assessmentError);
          // Continue with default score
        }
      }
      
      // Step 2: Try to generate embedding, but don't fail if it doesn't work
      let embeddingData = null;
      try {
        console.log("Attempting to generate embedding...");
        embeddingData = await this.generateEmbedding(content);
        console.log("Embedding generated successfully");
      } catch (embeddingError) {
        console.warn("Failed to generate embedding, proceeding without it:", embeddingError);
        // Continue without embedding - it's not critical for manual entries
      }

      console.log("Inserting knowledge into database...");
      
      // Step 3: Prepare metadata with quality assessment details
      const enhancedMetadata = {
        ...metadata,
        quality_assessment: qualityAssessment,
        assessment_date: qualityAssessment ? new Date().toISOString() : null,
        ai_assessed: useAIAssessment && !!qualityAssessment
      };
      
      // Insert the knowledge with or without embedding
      const insertData: any = {
        content,
        title,
        source,
        content_type: contentType,
        marketing_domain: marketingDomain,
        complexity_level: complexityLevel,
        tags,
        metadata: enhancedMetadata,
        quality_score: qualityScore
      };

      // Only add embedding if we successfully generated one
      if (embeddingData) {
        insertData.embedding = embeddingData;
      }

      const { data, error } = await supabase
        .from('global_knowledge')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error("Database error storing global knowledge:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Knowledge successfully stored with ID:", data.id);
      return data.id;
    } catch (error) {
      console.error("Exception in addKnowledge:", error);
      throw error; // Re-throw to let the UI handle it
    }
  }

  /**
   * Assess content quality using AI
   */
  public static async assessContentQuality(
    content: string,
    contentType?: string,
    marketingDomain?: string
  ): Promise<QualityAssessment> {
    try {
      const { data, error } = await supabase.functions.invoke("assess-content-quality", {
        body: { 
          content,
          contentType,
          marketingDomain
        }
      });
      
      if (error) {
        console.error("Error from assess-content-quality function:", error);
        throw new Error(`Quality assessment error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No assessment data returned from function");
      }
      
      console.log("Quality assessment data received:", data);
      return data as QualityAssessment;
    } catch (error) {
      console.error("Exception in assessContentQuality:", error);
      throw error;
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
      console.log("Calling generate-embedding function...");
      
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });
      
      if (error) {
        console.error("Error from generate-embedding function:", error);
        throw new Error(`Embedding function error: ${error.message}`);
      }
      
      if (!data || !data.embedding) {
        throw new Error("No embedding data returned from function");
      }
      
      console.log("Embedding data received, length:", data.embedding.length);
      return data.embedding;
    } catch (error) {
      console.error("Exception in generateEmbedding:", error);
      throw error;
    }
  }
}
