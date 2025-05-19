
import { supabase } from "@/integrations/supabase/client";
import { TextChunk } from "./TextChunkGenerator";

export class EmbeddingProcessor {
  /**
   * Process chunks of text into embeddings
   */
  public static async processChunks(chunks: TextChunk[], projectId: string): Promise<boolean> {
    try {
      console.log(`Processing ${chunks.length} chunks for project ${projectId}`);
      
      // Process chunks in batches to avoid overwhelming the API
      const batchSize = 5;
      const batches = this.createBatches(chunks, batchSize);
      
      let success = true;
      
      for (const batch of batches) {
        const results = await this.processBatch(batch, projectId);
        
        // Check if any failed
        if (results.some(result => result.error)) {
          console.error("Some chunks failed to process");
          success = false;
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error processing chunks:", error);
      return false;
    }
  }
  
  /**
   * Create batches from an array of chunks
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  /**
   * Process a batch of chunks
   */
  private static async processBatch(batch: TextChunk[], projectId: string): Promise<any[]> {
    const promises = batch.map(chunk => {
      return supabase.functions.invoke("process-embeddings", {
        body: {
          text: chunk.text,
          projectId: projectId,
          metadata: chunk.metadata
        }
      });
    });
    
    return Promise.all(promises);
  }
}
