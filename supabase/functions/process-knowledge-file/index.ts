
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
    const contentType = formData.get("contentType") as string;
    const marketingDomain = formData.get("marketingDomain") as string;
    const complexityLevel = formData.get("complexityLevel") as string;
    const tags = formData.get("tags") as string;
    
    if (!file) {
      throw new Error("No file provided");
    }
    
    // Extract text based on file type
    let fileContent = "";
    const fileType = file.type;
    const fileName = file.name;
    
    console.log(`Processing file: ${fileName}, type: ${fileType}`);
    
    // Handle different file types
    if (fileType === "application/pdf") {
      // For PDFs, we'll just use the text content for now
      // In a production environment, you'd want to use a proper PDF parser
      fileContent = await file.text();
    } 
    else if (fileType === "text/plain" || fileType === "text/markdown" || fileName.endsWith('.md')) {
      // For text and markdown files, just get the text
      fileContent = await file.text();
    }
    else if (fileType.includes("wordprocessingml.document") || fileName.endsWith('.docx')) {
      // For DOCX files, extract text (simplified - in production use proper parser)
      fileContent = await file.text();
    }
    else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    // Clean and validate content
    if (!fileContent || fileContent.trim().length < 10) {
      throw new Error("File content is too short or empty");
    }
    
    // Split content into chunks for better processing
    const chunks = splitIntoChunks(fileContent, 2000);
    console.log(`Generated ${chunks.length} text chunks from file`);
    
    // Process each chunk and add to the global_knowledge table
    let processedChunks = 0;
    
    for (const chunk of chunks) {
      try {
        // Generate an embedding for the chunk
        const embeddingResponse = await supabase.functions.invoke("generate-embedding", {
          body: { text: chunk },
        });
        
        if (embeddingResponse.error) {
          console.error(`Error generating embedding: ${embeddingResponse.error.message}`);
          continue;
        }
        
        const embedding = embeddingResponse.data.embedding;
        
        // Parse tags
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
        
        // Insert the chunk into the global_knowledge table
        const { error } = await supabase
          .from("global_knowledge")
          .insert({
            content: chunk,
            title: `${fileName} - Part ${processedChunks + 1}`,
            source: `Uploaded file: ${fileName}`,
            content_type: contentType || 'guide',
            marketing_domain: marketingDomain || 'general-marketing',
            complexity_level: complexityLevel || 'beginner',
            tags: tagsArray,
            embedding: embedding,
            metadata: {
              source_file: fileName,
              file_type: fileType,
              upload_date: new Date().toISOString(),
              chunk_index: processedChunks,
              total_chunks: chunks.length
            },
          });
        
        if (error) {
          console.error(`Error inserting chunk: ${error.message}`);
          continue;
        }
        
        processedChunks++;
      } catch (chunkError) {
        console.error(`Error processing chunk: ${chunkError.message}`);
        continue;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      chunks_processed: processedChunks,
      total_chunks: chunks.length,
      filename: fileName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing knowledge file:", error);
    
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
      // If paragraph doesn't fit, save current chunk and start new one
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
            
            // If a single sentence is longer than chunk size, split by words
            if (sentence.length > chunkSize) {
              const words = sentence.split(/\s+/);
              let wordChunk = "";
              
              for (const word of words) {
                if (wordChunk.length + word.length + 1 <= chunkSize) {
                  wordChunk += (wordChunk ? " " : "") + word;
                } else {
                  if (wordChunk) {
                    chunks.push(wordChunk.trim());
                  }
                  wordChunk = word;
                }
              }
              
              if (wordChunk) {
                currentChunk = wordChunk.trim();
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
  }
  
  // Add the last chunk if not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Filter out very short chunks
  return chunks.filter(chunk => chunk.length > 20);
}
