
import { supabase } from "@/integrations/supabase/client";

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
}
