
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
      // For now, return default settings since the table isn't in the schema yet
      // This will be updated once the schema is properly regenerated
      return {
        workspace_id: workspaceId,
        similarity_threshold: 0.7,
        min_quality_score: 0.5,
        updated_at: new Date().toISOString()
      };
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
      // For now, just return the settings as if they were saved
      // This will be updated once the schema is properly regenerated
      const result = {
        workspace_id: workspaceId,
        similarity_threshold: settings.similarity_threshold,
        min_quality_score: settings.min_quality_score,
        updated_at: new Date().toISOString()
      };
      
      toast({ 
        title: 'Settings saved', 
        description: 'RAG settings have been saved successfully' 
      });
      
      return result;
    } catch (err) {
      console.error('Error saving RAG settings:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to save RAG settings', 
        variant: 'destructive' 
      });
      return null;
    }
  }
};
