
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { supabase } from '@/integrations/supabase/client';
import { RAGSettingsService } from '@/services/RAGSettingsService';

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
        reasoning.push('Failed to generate query embedding, using keyword-based fallback');
        return this.fallbackResponse(context, reasoning);
      }

      reasoning.push('Generated query embedding successfully');

      const settings = await RAGSettingsService.getSettings(context.projectId);
      const sim = settings?.similarity_threshold ?? 0.25;
      const minQ = settings?.min_quality_score ?? 0.5;

      const retrievalStrategies = await Promise.allSettled([
        this.retrieveProjectContent(embeddingResponse, context.projectId, sim, minQ),
        this.retrieveGlobalKnowledge(embeddingResponse, context.taskType, sim, minQ),
        this.retrieveSemanticClusters(embeddingResponse, context.projectId)
      ]);

      const [projectContentResult, globalKnowledgeResult, semanticClustersResult] = retrievalStrategies;
      
      const projectContent = projectContentResult.status === 'fulfilled' ? projectContentResult.value : [];
      const globalKnowledge = globalKnowledgeResult.status === 'fulfilled' ? globalKnowledgeResult.value : [];
      const semanticClusters = semanticClustersResult.status === 'fulfilled' ? semanticClustersResult.value : [];
      
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
      return this.fallbackResponse(context, reasoning);
    }
  }

  private async fallbackResponse(context: AgentContext, reasoning: string[]): Promise<AgentResponse> {
    reasoning.push('Using keyword-based fallback retrieval');
    
    try {
      const keywordSources = await this.keywordBasedRetrieval(context.query, context.projectId);
      reasoning.push(`Fallback retrieved ${keywordSources.length} sources`);
      
      return {
        success: true,
        confidence: 0.4, // Lower confidence for fallback
        data: {
          sources: keywordSources,
          optimizedContext: this.optimizeContext(keywordSources, context.query),
          retrievalStats: {
            projectSources: keywordSources.length,
            globalSources: 0,
            semanticClusters: 0,
            qualityFiltered: keywordSources.length
          }
        },
        reasoning,
        metadata: {
          retrievalMethod: 'keyword-fallback'
        }
      };
    } catch (fallbackError) {
      reasoning.push(`Fallback also failed: ${fallbackError.message}`);
      return {
        success: false,
        confidence: 0,
        data: {
          sources: [],
          optimizedContext: '',
          retrievalStats: {
            projectSources: 0,
            globalSources: 0,
            semanticClusters: 0,
            qualityFiltered: 0
          }
        },
        reasoning
      };
    }
  }

  private async keywordBasedRetrieval(query: string, projectId: string): Promise<any[]> {
    try {
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
      
      const { data, error } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('project_id', projectId)
        .textSearch('content', keywords.join(' | '))
        .limit(5);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        similarity: 0.3, // Assign moderate similarity for keyword matches
        source_type: 'project',
        source_info: item.metadata?.source || 'Project Content'
      }));
    } catch (error) {
      console.error('Keyword-based retrieval failed:', error);
      return [];
    }
  }

  private async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });

      if (error || !data?.embedding) {
        console.error('Embedding generation failed:', error);
        return null;
      }

      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null;
    }
  }

  private async retrieveProjectContent(
    embedding: number[],
    projectId: string,
    threshold: number,
    minQuality: number
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('match_documents_quality_weighted', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: threshold,
        match_count: 8,
        p_project_id: projectId,
        p_min_quality_score: minQuality
      });

      return error ? [] : (data || []);
    } catch (error) {
      console.error('Error retrieving project content:', error);
      return [];
    }
  }

  private async retrieveGlobalKnowledge(
    embedding: number[],
    taskType: string,
    threshold: number,
    minQuality: number
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('match_documents_quality_weighted', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: threshold,
        match_count: 5,
        include_global: true,
        p_marketing_domain: taskType === 'marketing' ? 'marketing' : null,
        p_min_quality_score: minQuality
      });

      return error ? [] : (data || []).filter((item: any) => item.source_type === 'global');
    } catch (error) {
      console.error('Error retrieving global knowledge:', error);
      return [];
    }
  }

  private async retrieveSemanticClusters(embedding: number[], projectId: string): Promise<any[]> {
    // For now, return empty array - can be enhanced later
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
