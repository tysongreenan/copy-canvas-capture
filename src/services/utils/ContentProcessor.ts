
export interface ProcessingResult {
  success: boolean;
  contentId?: string;
  chunksProcessed?: number;
  embeddingsGenerated?: number;
  title?: string;
  message?: string;
  hasTranscript?: boolean;
}

export class ContentProcessor {
  /**
   * Check if content already exists to avoid reprocessing
   */
  public static async checkExistingContent(
    url: string, 
    projectId: string
  ): Promise<{ exists: boolean; content?: any; embeddingCount?: number }> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: existingContent } = await supabase
        .from('scraped_content')
        .select('id, title, content')
        .eq('url', url)
        .eq('project_id', projectId)
        .single();

      if (existingContent) {
        const { count: embeddingCount } = await supabase
          .from('content_embeddings')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .ilike('metadata->source', `%${url}%`);

        return {
          exists: true,
          content: existingContent,
          embeddingCount: embeddingCount || 0
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking existing content:', error);
      return { exists: false };
    }
  }

  /**
   * Store content in database
   */
  public static async storeContent(
    projectId: string,
    url: string,
    title: string,
    content: any
  ): Promise<{ success: boolean; contentId?: string; error?: string }> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: contentData, error: contentError } = await supabase
        .from('scraped_content')
        .insert({
          project_id: projectId,
          url: url,
          title: title,
          content: content
        })
        .select()
        .single();

      if (contentError) {
        return { success: false, error: contentError.message };
      }

      return { success: true, contentId: contentData.id };
    } catch (error) {
      console.error('Error storing content:', error);
      return { success: false, error: 'Failed to store content' };
    }
  }

  /**
   * Enhanced error handling with user-friendly messages
   */
  public static formatError(error: any): string {
    if (typeof error === 'string') return error;
    
    if (error?.message) {
      // Convert technical errors to user-friendly messages
      if (error.message.includes('Invalid YouTube URL')) {
        return 'Please provide a valid YouTube video URL';
      }
      if (error.message.includes('No active session')) {
        return 'Please sign in to continue';
      }
      if (error.message.includes('rate limit')) {
        return 'Please wait a moment before trying again';
      }
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}
