
import { supabase } from "@/integrations/supabase/client";
import { ScrapedContent } from "@/services/ScraperTypes";
import { TextChunk, TextChunkGenerator } from "@/services/TextChunkGenerator";

export class EmbeddingService {
  /**
   * Process a project's content for AI chat by generating embeddings
   */
  public static async processProject(projectId: string, pages: ScrapedContent[]): Promise<boolean> {
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated");
        return false;
      }
      
      // Check if we have valid pages to process
      if (!pages || pages.length === 0) {
        console.error("No valid pages provided for processing");
        return false;
      }
      
      let successCount = 0;
      let failureCount = 0;
      
      // Process each page
      for (const page of pages) {
        // Skip error pages
        if (page.title === "Error" || page.url.includes("error")) {
          console.log(`Skipping error page: ${page.url}`);
          continue;
        }
        
        try {
          // Generate chunks from the page content
          const chunks = TextChunkGenerator.generateChunks(page);
          
          // Process each chunk
          for (const chunk of chunks) {
            if (chunk.text && chunk.text.trim().length > 20) {
              const chunkSuccess = await this.generateEmbedding(
                chunk.text,
                projectId,
                chunk.metadata
              );
              
              if (chunkSuccess) successCount++;
              else failureCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing page ${page.url}:`, error);
          failureCount++;
        }
      }
      
      console.log(`Embedding generation complete. Success: ${successCount}, Failures: ${failureCount}`);
      
      // Return true if at least some embeddings were successful
      return successCount > 0;
    } catch (error) {
      console.error("Error processing project for embeddings:", error);
      return false;
    }
  }
  
  /**
   * Generate an embedding for a single piece of text
   */
  private static async generateEmbedding(
    text: string,
    projectId: string,
    metadata: { source: string; title?: string; type: string }
  ): Promise<boolean> {
    try {
      // Skip very short text
      if (text.trim().length < 10) {
        return false;
      }
      
      // Call the edge function to generate the embedding
      const { data, error } = await supabase.functions.invoke("process-embeddings", {
        body: {
          text,
          projectId,
          metadata
        }
      });
      
      if (error) {
        console.error("Error generating embedding:", error);
        return false;
      }
      
      return data?.success || false;
    } catch (error) {
      console.error("Error generating embedding:", error);
      return false;
    }
  }
}
