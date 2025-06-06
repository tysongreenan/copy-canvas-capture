import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WorkspaceRAGSettings {
  workspace_id: string;
  similarity_threshold: number;
  min_quality_score: number;
  updated_at: string;
}

export const RAGSettingsService = {
  async getSettings(workspaceId: string): Promise<WorkspaceRAGSettings | null> {
    try {
      const { data, error } = await supabase
        .from('workspace_rag_settings')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single();
      if (error) {
        console.error('Error fetching RAG settings:', error);
        return null;
      }
      return data as WorkspaceRAGSettings;
    } catch (err) {
      console.error('Error fetching RAG settings:', err);
      return null;
    }
  },

  async saveSettings(
    workspaceId: string,
    settings: { similarity_threshold: number; min_quality_score: number }
  ): Promise<WorkspaceRAGSettings | null> {
    try {
      const { data, error } = await supabase
        .from('workspace_rag_settings')
        .upsert(
          {
            workspace_id: workspaceId,
            similarity_threshold: settings.similarity_threshold,
            min_quality_score: settings.min_quality_score,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'workspace_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Error saving RAG settings:', error);
        toast({ title: 'Error', description: 'Failed to save RAG settings', variant: 'destructive' });
        return null;
      }
      return data as WorkspaceRAGSettings;
    } catch (err) {
      console.error('Error saving RAG settings:', err);
      toast({ title: 'Error', description: 'Failed to save RAG settings', variant: 'destructive' });
      return null;
    }
  }
};
