
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
    
    // Extract text based on file type
    let fileContent = "";
    
    const fileType = file.type;
    const fileName = file.name;
    
    console.log(`Processing file: ${fileName}, type: ${fileType}`);
    
    // Handle different file types
    if (fileType === "application/pdf") {
      // For PDFs, use existing processing logic
      fileContent = await file.text();
    } 
    else if (fileType === "text/plain" || fileType === "text/markdown") {
      // For text and markdown files, just get the text
      fileContent = await file.text();
    }
    else if (fileType.includes("wordprocessingml.document")) {
      // For DOCX files, extract text (simplified in this example)
      fileContent = await file.text(); // In a real implementation, you'd use a library to parse DOCX
    }
    else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    // Split content into chunks for embedding
    const chunks = splitIntoChunks(fileContent, 1000);
    
    console.log(`Generated ${chunks.length} text chunks from file`);
    
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
            source: fileName,
            type: "uploaded_file",
            file_type: fileType,
            upload_date: new Date().toISOString()
          },
        });
      
      if (error) {
        throw new Error(`Error inserting chunk: ${error.message}`);
      }
    }
    
    return new Response(JSON.stringify({ success: true, chunks_processed: chunks.length }), {
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
  
  // First, try to split by paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue; // Skip empty paragraphs
    
    if (currentChunk.length + paragraph.length <= chunkSize) {
      // If paragraph fits in the current chunk, add it
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph.trim();
    } else {
      // If paragraph doesn't fit, start spliting by sentences
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      
      // If a single paragraph is longer than chunk size, split by sentences
      if (paragraph.length > chunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
          if (!sentence.trim()) continue;
          
          if (currentChunk.length + sentence.length <= chunkSize) {
            currentChunk += (currentChunk ? " " : "") + sentence.trim();
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = "";
            }
            
            // If a single sentence is longer than chunk size, just add it
            if (sentence.length > chunkSize) {
              const words = sentence.split(/\s+/);
              let wordChunk = "";
              
              for (const word of words) {
                if (wordChunk.length + word.length + 1 <= chunkSize) {
                  wordChunk += (wordChunk ? " " : "") + word;
                } else {
                  chunks.push(wordChunk.trim());
                  wordChunk = word;
                }
              }
              
              if (wordChunk) {
                chunks.push(wordChunk.trim());
              }
            } else {
              currentChunk = sentence.trim();
            }
          }
        }
      } else {
        currentChunk = paragraph.trim();
      }
    }
    
    // Add the last chunk if not empty
    if (currentChunk && !chunks.includes(currentChunk.trim())) {
      chunks.push(currentChunk.trim());
    }
  }
  
  return chunks;
}
