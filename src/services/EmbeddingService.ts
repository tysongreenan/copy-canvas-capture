import { supabase } from "@/integrations/supabase/client";
import { ScrapedContent } from './ScraperTypes';

export class EmbeddingService {
  /**
   * Process a project and generate embeddings for each page
   */
  public static async processProject(projectId: string, pages: ScrapedContent[]): Promise<boolean> {
    try {
      // Loop through each page and generate embeddings
      for (const page of pages) {
        // Combine all text content from the page
        const combinedText = `${page.title}\n${page.metaDescription}\n${page.metaKeywords}\n${page.headings.map(h => h.text).join('\n')}\n${page.paragraphs.join('\n')}\n${page.links.map(l => l.text).join('\n')}\n${page.listItems.join('\n')}`;
        
        // Split the combined text into smaller chunks
        const chunks = this.splitTextIntoChunks(combinedText, 1000);
        
        // Generate embeddings for each chunk
        for (const chunk of chunks) {
          // Call the Supabase edge function to generate the embedding
          const embeddingResponse = await supabase.functions.invoke("generate-embedding", {
            body: { text: chunk },
          });
          
          if (embeddingResponse.error) {
            console.error("Error generating embedding:", embeddingResponse.error);
            continue; // Skip to the next chunk if there's an error
          }
          
          const embedding = embeddingResponse.data.embedding;
          
          // Insert the chunk into the document_chunks table
          const { error } = await supabase
            .from("document_chunks")
            .insert({
              content: chunk,
              project_id: projectId,
              embedding: embedding,
              metadata: {
                source: page.url,
                title: page.title,
                type: "website",
              },
            });
          
          if (error) {
            console.error("Error inserting chunk:", error);
            continue; // Skip to the next chunk if there's an error
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in embedding service:", error);
      return false;
    }
  }
  
  /**
   * Split text into chunks of a maximum size
   */
  private static splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Process a file for embedding
   */
  public static async processFile(file: File, projectId: string): Promise<boolean> {
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      // Call the Supabase edge function to process the file
      const { error } = await supabase.functions.invoke("process-file", {
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (error) {
        console.error("Error processing file:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in file processing service:", error);
      return false;
    }
  }
}
