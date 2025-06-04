
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { supabase } from '@/integrations/supabase/client';

export class RAGSpecialistAgent extends BaseAgent {
  constructor() {
    super('RAG Specialist', 'Advanced knowledge retrieval and context optimization');
  }

  async process(context: AgentContext): Promise<AgentResponse> {
    const reasoning: string[] = [];
    reasoning.push(`Analyzing query: "${context.query}"`);

    try {
      const embeddingResponse = await this.generateEmbedding(context.query);
      if (!embeddingResponse) {
        return {
          success: false,
          confidence: 0,
          data: null,
          reasoning: [...reasoning, 'Failed to generate query embedding']
        };
      }

      reasoning.push('Generated query embedding successfully');

      const retrievalStrategies = await Promise.all([
        this.retrieveProjectContent(embeddingResponse, context.projectId),
        this.retrieveGlobalKnowledge(embeddingResponse, context.taskType),
        this.retrieveSemanticClusters(embeddingResponse, context.projectId)
      ]);

      const [projectContent, globalKnowledge, semanticClusters] = retrievalStrategies;
      
      reasoning.push(`Retrieved ${projectContent.length} project documents`);
      reasoning.push(`Retrieved ${globalKnowledge.length} global knowledge items`);
      reasoning.push(`Found ${semanticClusters.length} semantic clusters`);

      const qualityFilteredContent = this.assessContentQuality([
        ...projectContent,
        ...globalKnowledge,
        ...semanticClusters
      ]);

      reasoning.push(`Quality filtering retained ${qualityFilteredContent.length} high-quality sources`);

      const optimizedContext = this.optimizeContext(qualityFilteredContent, context.query);
      
      const confidence = this.calculateConfidence(qualityFilteredContent, context.query);
      reasoning.push(`Calculated retrieval confidence: ${Math.round(confidence * 100)}%`);

      return {
        success: true,
        confidence,
        data: {
          sources: qualityFilteredContent,
          optimizedContext,
          retrievalStats: {
            projectSources: projectContent.length,
            globalSources: globalKnowledge.length,
            semanticClusters: semanticClusters.length,
            qualityFiltered: qualityFilteredContent.length
          }
        },
        reasoning,
        metadata: {
          queryEmbedding: embeddingResponse,
          retrievalMethod: 'multi-strategy'
        }
      };
    } catch (error) {
      reasoning.push(`Error during retrieval: ${error.message}`);
      return {
        success: false,
        confidence: 0,
        data: null,
        reasoning
      };
    }
  }

  private async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });

      if (error || !data?.embedding) {
        return null;
      }

      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null;
    }
  }

  private async retrieveProjectContent(embedding: number[], projectId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('match_documents_quality_weighted', {
        query_embedding: embedding as any,
        match_threshold: 0.25,
        match_count: 8,
        p_project_id: projectId,
        p_min_quality_score: 50
      });

      return error ? [] : (data || []);
    } catch (error) {
      console.error('Error retrieving project content:', error);
      return [];
    }
  }

  private async retrieveGlobalKnowledge(embedding: number[], taskType: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('match_documents_quality_weighted', {
        query_embedding: embedding as any,
        match_threshold: 0.3,
        match_count: 5,
        include_global: true,
        p_marketing_domain: taskType === 'marketing' ? 'marketing' : null,
        p_min_quality_score: 70
      });

      return error ? [] : (data || []).filter((item: any) => item.source_type === 'global');
    } catch (error) {
      console.error('Error retrieving global knowledge:', error);
      return [];
    }
  }

  private async retrieveSemanticClusters(embedding: number[], projectId: string): Promise<any[]> {
    return [];
  }

  private assessContentQuality(sources: any[]): any[] {
    return sources
      .filter(source => {
        const hasContent = source.content && source.content.length > 50;
        const hasGoodQuality = (source.quality_score || 0) >= 0.5;
        const hasRelevance = (source.similarity || 0) >= 0.25;
        
        return hasContent && hasGoodQuality && hasRelevance;
      })
      .sort((a, b) => (b.weighted_score || b.similarity || 0) - (a.weighted_score || a.similarity || 0))
      .slice(0, 10);
  }

  private optimizeContext(sources: any[], query: string): string {
    if (!sources.length) return '';

    const highRelevance = sources.filter(s => (s.similarity || 0) > 0.6);
    const mediumRelevance = sources.filter(s => (s.similarity || 0) > 0.4 && (s.similarity || 0) <= 0.6);
    
    let context = '';
    
    if (highRelevance.length > 0) {
      context += 'High Relevance Information:\n';
      context += highRelevance.map(s => s.content).join('\n\n');
      context += '\n\n';
    }
    
    if (mediumRelevance.length > 0) {
      context += 'Supporting Information:\n';
      context += mediumRelevance.map(s => s.content).join('\n\n');
    }
    
    return context;
  }

  private calculateConfidence(sources: any[], query: string): number {
    if (!sources.length) return 0;

    const avgSimilarity = sources.reduce((sum, s) => sum + (s.similarity || 0), 0) / sources.length;
    const avgQuality = sources.reduce((sum, s) => sum + (s.quality_score || 0.5), 0) / sources.length;
    const sourceCount = Math.min(sources.length / 10, 1);

    return (avgSimilarity * 0.4 + avgQuality * 0.4 + sourceCount * 0.2);
  }
}
