
export class EmbeddingUtils {
  /**
   * Split text into chunks with optimal sizing
   */
  public static splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
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

  /**
   * Process embeddings in batches to avoid rate limiting
   */
  public static async processBatchedEmbeddings(
    chunks: string[],
    projectId: string,
    metadata: any = {},
    batchSize: number = 5,
    delayMs: number = 100,
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      try {
        const promises = batch.map(chunk => 
          this.processChunkEmbedding(chunk, projectId, metadata)
        );
        
        const results = await Promise.allSettled(promises);
        
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            successful++;
          } else {
            failed++;
          }
        });
        
        if (onProgress) {
          onProgress(i + batch.length, chunks.length);
        }
        
        // Add delay between batches
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error('Batch processing error:', error);
        failed += batch.length;
      }
    }

    return { successful, failed };
  }

  /**
   * Process a single chunk embedding
   */
  private static async processChunkEmbedding(
    chunk: string,
    projectId: string,
    metadata: any
  ): Promise<boolean> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase.functions.invoke('process-embeddings', {
        body: {
          text: chunk,
          projectId: projectId,
          metadata: metadata
        }
      });

      return !error;
    } catch (error) {
      console.error('Chunk embedding error:', error);
      return false;
    }
  }

  /**
   * Validate and clean text content
   */
  public static cleanText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/\\u0026/g, '&')
      .replace(/\\u003c/g, '<')
      .replace(/\\u003e/g, '>')
      .replace(/\\u0027/g, "'")
      .replace(/\\u0022/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
