import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export interface ProjectStats {
  avg_confidence: number | null;
  frequent_queries: { query_text: string; query_count: number }[];
}

export const RAGQueryService = {
  logQuery: async (
    projectId: string,
    query: string,
    sourceIds: string[],
    confidence: number
  ) => {
    await supabase.from('rag_queries').insert({
      project_id: projectId,
      query_text: query,
      source_ids: sourceIds,
      confidence
    } as Database['public']['Tables']['rag_queries']['Insert']);
  },

  getStats: async (projectId: string): Promise<ProjectStats> => {
    const { data, error } = await supabase.rpc('get_rag_query_stats', {
      p_project_id: projectId
    });
    if (error || !data || data.length === 0) {
      return { avg_confidence: null, frequent_queries: [] };
    }
    return {
      avg_confidence: data[0].avg_confidence as number | null,
      frequent_queries: (data[0].frequent_queries as any[]) || []
    };
  },

  getAverageConfidence: async (projectId: string): Promise<number | null> => {
    const stats = await RAGQueryService.getStats(projectId);
    return stats.avg_confidence;
  }
};
