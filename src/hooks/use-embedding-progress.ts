import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmbeddingProgress(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["embedding-progress", projectId],
    queryFn: async () => {
      const { count: total } = await supabase
        .from('embedding_jobs')
        .select('*', { count: 'exact', head: true })
        .contains('payload', { projectId });

      const { count: done } = await supabase
        .from('embedding_jobs')
        .select('*', { count: 'exact', head: true })
        .contains('payload', { projectId })
        .in('status', ['complete', 'failed']);

      const { count: failed } = await supabase
        .from('embedding_jobs')
        .select('*', { count: 'exact', head: true })
        .contains('payload', { projectId })
        .eq('status', 'failed');

      return { total: total || 0, done: done || 0, failed: failed || 0 };
    },
    refetchInterval: enabled ? 2000 : false,
  });
}
