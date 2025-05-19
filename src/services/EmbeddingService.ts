
import { supabase } from "@/integrations/supabase/client";
import { ScrapedContent } from "./ScraperTypes";

export interface TextChunk {
  text: string;
  metadata: {
    source: string;
    title?: string;
    type: string;
  };
}

export class EmbeddingService {
  /**
   * Process scraped content to generate embeddings
   */
  public static async processContent(content: ScrapedContent, projectId: string): Promise<boolean> {
    try {
      const chunks = this.chunkContent(content);
      
      console.log(`Generated ${chunks.length} chunks from content at ${content.url}`);
      
      // Process chunks in batches to avoid overwhelming the API
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        batches.push(chunks.slice(i, i + batchSize));
      }
      
      let success = true;
      
      for (const batch of batches) {
        const promises = batch.map(chunk => {
          return supabase.functions.invoke("process-embeddings", {
            body: {
              text: chunk.text,
              projectId: projectId,
              metadata: chunk.metadata
            }
          });
        });
        
        const results = await Promise.all(promises);
        
        // Check if any failed
        for (const result of results) {
          if (result.error) {
            console.error("Error processing chunk:", result.error);
            success = false;
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error processing content embeddings:", error);
      return false;
    }
  }
  
  /**
   * Split content into smaller chunks suitable for embeddings
   */
  private static chunkContent(content: ScrapedContent): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Process title
    if (content.title) {
      chunks.push({
        text: `Page Title: ${content.title}`,
        metadata: {
          source: content.url,
          title: content.title,
          type: 'title'
        }
      });
    }
    
    // Process meta description if available
    if (content.metaDescription) {
      chunks.push({
        text: `Page Description: ${content.metaDescription}`,
        metadata: {
          source: content.url,
          title: content.title,
          type: 'meta_description'
        }
      });
    }
    
    // Process headings with their text
    if (content.headings && content.headings.length > 0) {
      // Group nearby headings together
      const headingChunks: string[] = [];
      let currentChunk = "";
      
      content.headings.forEach((heading, index) => {
        const headingText = `${heading.tag.toUpperCase()}: ${heading.text}\n`;
        
        // If adding this heading would make the chunk too large, start a new chunk
        if (currentChunk.length + headingText.length > 1000) {
          headingChunks.push(currentChunk);
          currentChunk = headingText;
        } else {
          currentChunk += headingText;
        }
        
        // If last heading, add the current chunk
        if (index === content.headings.length - 1 && currentChunk) {
          headingChunks.push(currentChunk);
        }
      });
      
      // Add heading chunks
      headingChunks.forEach(chunk => {
        chunks.push({
          text: chunk,
          metadata: {
            source: content.url,
            title: content.title,
            type: 'headings'
          }
        });
      });
    }
    
    // Process paragraphs
    if (content.paragraphs && content.paragraphs.length > 0) {
      // Group paragraphs into chunks of approximately 1500 characters
      const chunkSize = 1500;
      let currentChunk = "";
      
      content.paragraphs.forEach((paragraph, index) => {
        // Skip empty paragraphs
        if (!paragraph.trim()) return;
        
        // If adding this paragraph would make the chunk too large, start a new chunk
        if (currentChunk.length + paragraph.length > chunkSize) {
          chunks.push({
            text: currentChunk,
            metadata: {
              source: content.url,
              title: content.title,
              type: 'paragraphs'
            }
          });
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
        
        // If last paragraph, add the current chunk
        if (index === content.paragraphs.length - 1 && currentChunk) {
          chunks.push({
            text: currentChunk,
            metadata: {
              source: content.url,
              title: content.title,
              type: 'paragraphs'
            }
          });
        }
      });
    }
    
    // Process list items
    if (content.listItems && content.listItems.length > 0) {
      // Group list items into chunks of approximately 1500 characters
      const chunkSize = 1500;
      let currentChunk = "";
      
      content.listItems.forEach((item, index) => {
        const listItemText = `• ${item}\n`;
        
        // If adding this item would make the chunk too large, start a new chunk
        if (currentChunk.length + listItemText.length > chunkSize) {
          chunks.push({
            text: currentChunk,
            metadata: {
              source: content.url,
              title: content.title,
              type: 'list_items'
            }
          });
          currentChunk = listItemText;
        } else {
          currentChunk += listItemText;
        }
        
        // If last item, add the current chunk
        if (index === content.listItems.length - 1 && currentChunk) {
          chunks.push({
            text: currentChunk,
            metadata: {
              source: content.url,
              title: content.title,
              type: 'list_items'
            }
          });
        }
      });
    }
    
    return chunks;
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
