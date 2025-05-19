
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;
    
    if (!file || !projectId) {
      throw new Error("Missing file or project ID");
    }
    
    // Extract text from the PDF file (simplified example)
    // In a real implementation, you'd use a PDF parser library or another service
    const fileContent = await file.text();
    
    // Split content into chunks for embedding
    const chunks = splitIntoChunks(fileContent, 1000);
    
    // Process each chunk and add to the document_chunks table
    for (const chunk of chunks) {
      // Generate an embedding for the chunk
      const embeddingResponse = await supabase.functions.invoke("generate-embedding", {
        body: { text: chunk },
      });
      
      if (embeddingResponse.error) {
        throw new Error(`Error generating embedding: ${embeddingResponse.error.message}`);
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
            source: file.name,
            type: "file",
          },
        });
      
      if (error) {
        throw new Error(`Error inserting chunk: ${error.message}`);
      }
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to split text into chunks
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  
  let currentChunk = "";
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim() + ".";
    
    if (currentChunk.length + trimmedSentence.length <= chunkSize) {
      currentChunk += " " + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmedSentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
