import { supabase } from "@/integrations/supabase/client";
import { ScrapedContent } from "@/services/ScraperTypes";

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
          // Process title
          if (page.title) {
            const titleSuccess = await this.generateEmbedding(
              page.title,
              projectId,
              {
                source: page.url,
                title: page.title,
                type: 'title'
              }
            );
            
            if (titleSuccess) successCount++;
            else failureCount++;
          }
          
          // Process main content
          if (page.content && typeof page.content === 'object') {
            // Process each content section
            for (const [key, value] of Object.entries(page.content)) {
              if (typeof value === 'string' && value.trim().length > 20) {
                const contentSuccess = await this.generateEmbedding(
                  value,
                  projectId,
                  {
                    source: page.url,
                    title: page.title,
                    type: key
                  }
                );
                
                if (contentSuccess) successCount++;
                else failureCount++;
              }
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
