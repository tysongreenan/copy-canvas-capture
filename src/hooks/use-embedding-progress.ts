
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmbeddingProgress(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["embedding-progress", projectId],
    queryFn: async () => {
      // For now, return a simple progress structure
      // This will be enhanced once the schema is properly updated
      const { count: embeddingCount } = await supabase
        .from('document_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const { count: contentCount } = await supabase
        .from('scraped_content')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Estimate progress based on content vs embeddings ratio
      const total = contentCount || 0;
      const done = embeddingCount || 0;
      const failed = 0; // We'll track this differently for now

      return { total, done, failed };
    },
    refetchInterval: enabled ? 3000 : false,
    enabled: enabled && !!projectId,
  });
}
