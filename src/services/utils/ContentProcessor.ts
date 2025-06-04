
export interface ProcessingResult {
  success: boolean;
  contentId?: string;
  chunksProcessed?: number;
  embeddingsGenerated?: number;
  title?: string;
  message?: string;
  hasTranscript?: boolean;
  research?: any;
}

export class ContentProcessor {
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
          .from('document_chunks')
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

  public static formatError(error: any): string {
    if (typeof error === 'string') return error;
    
    if (error?.message) {
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

  public static async checkEmbeddingHealth(
    projectId: string
  ): Promise<{ 
    hasContent: boolean; 
    hasEmbeddings: boolean; 
    contentCount: number; 
    embeddingCount: number;
    healthScore: number;
  }> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { count: contentCount } = await supabase
        .from('scraped_content')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const { count: embeddingCount } = await supabase
        .from('document_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const hasContent = (contentCount || 0) > 0;
      const hasEmbeddings = (embeddingCount || 0) > 0;
      
      let healthScore = 0;
      if (hasContent && hasEmbeddings) {
        const ratio = (embeddingCount || 0) / Math.max(contentCount || 1, 1);
        healthScore = Math.min(100, Math.round(ratio * 100));
      }

      return {
        hasContent,
        hasEmbeddings,
        contentCount: contentCount || 0,
        embeddingCount: embeddingCount || 0,
        healthScore
      };
    } catch (error) {
      console.error('Error checking embedding health:', error);
      return {
        hasContent: false,
        hasEmbeddings: false,
        contentCount: 0,
        embeddingCount: 0,
        healthScore: 0
      };
    }
  }

  public static async processMissingEmbeddings(
    projectId: string,
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ successful: number; failed: number; message: string }> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: contentData } = await supabase
        .from('scraped_content')
        .select('id, url, title, content')
        .eq('project_id', projectId);

      if (!contentData || contentData.length === 0) {
        return { successful: 0, failed: 0, message: 'No content found to process' };
      }

      let successful = 0;
      let failed = 0;

      // Process content items
      for (const [index, content] of contentData.entries()) {
        try {
          const { count: existingCount } = await supabase
            .from('document_chunks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .eq('metadata->source', content.url);

          if ((existingCount || 0) > 0) {
            successful++;
            continue;
          }

          const contentText = this.extractTextFromContent(content.content);
          const chunks = this.splitTextIntoChunks(contentText);

          for (const chunk of chunks) {
            const { error } = await supabase.functions.invoke('process-embeddings', {
              body: {
                text: chunk,
                projectId: projectId,
                metadata: {
                  type: 'scraped_content',
                  title: content.title,
                  source: content.url,
                  contentId: content.id
                }
              }
            });

            if (error) {
              console.error('Error creating embedding:', error);
              failed++;
            } else {
              successful++;
            }
          }

          onProgress?.(index + 1, contentData.length);
        } catch (error) {
          console.error(`Error processing content ${content.id}:`, error);
          failed++;
        }
      }

      return {
        successful,
        failed,
        message: `Processed ${successful} chunks successfully, ${failed} failed`
      };
    } catch (error) {
      console.error('Error processing missing embeddings:', error);
      return { successful: 0, failed: 1, message: 'Failed to process embeddings' };
    }
  }

  private static extractTextFromContent(content: any): string {
    if (typeof content === 'string') return content;
    
    let text = '';
    if (content.headings) {
      text += content.headings.map((h: any) => h.text).join(' ') + ' ';
    }
    if (content.paragraphs) {
      text += content.paragraphs.join(' ') + ' ';
    }
    if (content.meta_description) {
      text += content.meta_description + ' ';
    }
    
    return text.trim();
  }

  private static splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
    if (!text || text.length <= maxChunkSize) {
      return text ? [text] : [];
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
      
      if (potentialChunk.length <= maxChunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }

    return chunks.filter(chunk => chunk.length > 20);
  }
}
