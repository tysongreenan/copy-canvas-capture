
import { ScrapedContent } from "./ScraperTypes";
import { TextChunkGenerator, TextChunk } from "./TextChunkGenerator";
import { EmbeddingProcessor } from "./EmbeddingProcessor";

// Fix the re-export to use 'export type' for TypeScript compatibility with isolatedModules
export type { TextChunk };

export class EmbeddingService {
  /**
   * Process scraped content to generate embeddings
   */
  public static async processContent(content: ScrapedContent, projectId: string): Promise<boolean> {
    try {
      // Skip processing if content has an error
      if (content.title === 'Error') {
        console.log(`Skipping embedding generation for error content at ${content.url}`);
        return false;
      }
      
      const chunks = TextChunkGenerator.generateChunks(content);
      
      console.log(`Generated ${chunks.length} chunks from content at ${content.url}`);
      
      return EmbeddingProcessor.processChunks(chunks, projectId);
    } catch (error) {
      console.error("Error processing content embeddings:", error);
      return false;
    }
  }
  
  /**
   * Process all pages in a project
   */
  public static async processProject(projectId: string, pages: ScrapedContent[]): Promise<boolean> {
    try {
      let success = true;
      
      for (const page of pages) {
        const pageSuccess = await this.processContent(page, projectId);
        if (!pageSuccess) {
          success = false;
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error processing project embeddings:", error);
      return false;
    }
  }
}
