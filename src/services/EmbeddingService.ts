
import { supabase } from "@/integrations/supabase/client";
import { ScrapedContent } from "./ScraperTypes";
import { TextChunk, TextChunkGenerator } from "./TextChunkGenerator";
import { EmbeddingProcessor } from "./EmbeddingProcessor";

export class EmbeddingService {
  /**
   * Process a file by uploading it to the Supabase edge function for processing
   */
  public static async processFile(file: File, projectId: string): Promise<boolean> {
    try {
      console.log(`Processing file: ${file.name} (${file.type}) for project: ${projectId}`);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      
      // Call the process-file edge function
      const { data, error } = await supabase.functions.invoke("process-file", {
        body: formData
      });
      
      if (error) {
        console.error("Error processing file:", error);
        return false;
      }
      
      console.log("File processing result:", data);
      return data.success === true;
    } catch (error) {
      console.error("Exception in processFile:", error);
      return false;
    }
  }
  
  /**
   * Generate embeddings for a piece of text
   */
  public static async generateEmbedding(text: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });
      
      if (error) throw error;
      
      return data.embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }

  /**
   * Process an entire project's content for embeddings
   */
  public static async processProject(projectId: string, contents: ScrapedContent[]): Promise<boolean> {
    try {
      console.log(`Processing ${contents.length} pages for project: ${projectId}`);
      let allSuccess = true;
      
      // Process each content page
      for (const content of contents) {
        // Skip pages with errors
        if (content.title === 'Error') {
          console.log(`Skipping page with error: ${content.url}`);
          continue;
        }

        // Generate text chunks from the content
        const chunks = TextChunkGenerator.generateChunks(content);
        console.log(`Generated ${chunks.length} chunks from ${content.url}`);
        
        // Process chunks to create embeddings
        const success = await EmbeddingProcessor.processChunks(chunks, projectId);
        
        if (!success) {
          console.error(`Failed to process chunks for ${content.url}`);
          allSuccess = false;
        }
      }
      
      return allSuccess;
    } catch (error) {
      console.error("Error processing project for embeddings:", error);
      return false;
    }
  }
}
