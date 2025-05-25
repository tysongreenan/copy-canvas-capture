
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
    
    // Handle different file types with improved extraction
    if (fileType === "application/pdf") {
      // For PDFs, extract text content
      fileContent = await extractPdfContent(file);
    } 
    else if (fileType === "text/plain" || fileType === "text/markdown" || fileName.endsWith('.md')) {
      // For text and markdown files, just get the text
      fileContent = await file.text();
    }
    else if (fileType.includes("wordprocessingml.document") || fileName.endsWith('.docx')) {
      // For DOCX files, extract structured content
      fileContent = await extractDocxContent(file);
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
    let failedChunks = 0;
    const processedResults = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        // Generate an embedding for the chunk with retry logic
        let embedding = null;
        let embeddingError = null;
        
        try {
          embedding = await generateEmbeddingWithRetry(supabase, chunk);
        } catch (error) {
          embeddingError = error.message;
          console.warn(`Failed to generate embedding for chunk ${i + 1}:`, error.message);
          // Continue without embedding - we'll still store the content
        }
        
        // Generate AI quality assessment
        let qualityScore = 0.7; // Default baseline
        let qualityAssessment = null;
        
        try {
          console.log(`Assessing quality for chunk ${i + 1}...`);
          const assessmentResponse = await supabase.functions.invoke("assess-content-quality", {
            body: { 
              content: chunk,
              contentType,
              marketingDomain
            }
          });
          
          if (assessmentResponse.data && !assessmentResponse.error) {
            qualityAssessment = assessmentResponse.data;
            qualityScore = qualityAssessment.overall_score;
            console.log(`Quality assessment completed for chunk ${i + 1}:`, qualityScore);
          } else {
            console.warn(`Quality assessment failed for chunk ${i + 1}:`, assessmentResponse.error);
          }
        } catch (assessmentError) {
          console.warn(`Quality assessment error for chunk ${i + 1}:`, assessmentError.message);
          // Continue with baseline score
        }
        
        // Parse tags
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
        
        // Insert the chunk into the global_knowledge table
        const insertData = {
          content: chunk,
          title: `${fileName} - Part ${i + 1}`,
          source: `Uploaded file: ${fileName}`,
          content_type: contentType || 'guide',
          marketing_domain: marketingDomain || 'general-marketing',
          complexity_level: complexityLevel || 'beginner',
          tags: tagsArray,
          quality_score: qualityScore,
          metadata: {
            source_file: fileName,
            file_type: fileType,
            upload_date: new Date().toISOString(),
            chunk_index: i,
            total_chunks: chunks.length,
            embedding_status: embedding ? 'success' : 'failed',
            embedding_error: embeddingError,
            content_length: chunk.length,
            quality_assessment: qualityAssessment,
            assessment_date: qualityAssessment ? new Date().toISOString() : null,
            ai_assessed: !!qualityAssessment
          },
        };

        // Only add embedding if we successfully generated one
        if (embedding) {
          insertData.embedding = embedding;
        }
        
        const { data, error } = await supabase
          .from("global_knowledge")
          .insert(insertData)
          .select('id')
          .single();
        
        if (error) {
          console.error(`Error inserting chunk ${i + 1}:`, error.message);
          failedChunks++;
          processedResults.push({
            chunk_index: i + 1,
            status: 'failed',
            error: error.message
          });
          continue;
        }
        
        processedChunks++;
        processedResults.push({
          chunk_index: i + 1,
          status: 'success',
          id: data.id,
          has_embedding: !!embedding,
          quality_score: qualityScore
        });
        
      } catch (chunkError) {
        console.error(`Error processing chunk ${i + 1}:`, chunkError.message);
        failedChunks++;
        processedResults.push({
          chunk_index: i + 1,
          status: 'failed',
          error: chunkError.message
        });
        continue;
      }
    }
    
    const processingResult = {
      success: processedChunks > 0,
      chunks_processed: processedChunks,
      chunks_failed: failedChunks,
      total_chunks: chunks.length,
      filename: fileName,
      processing_details: processedResults,
      overall_status: processedChunks === chunks.length ? 'complete' : 
                     processedChunks > 0 ? 'partial' : 'failed'
    };
    
    console.log('Processing complete:', processingResult);
    
    return new Response(JSON.stringify(processingResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing knowledge file:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      overall_status: 'failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to generate embeddings with retry logic
async function generateEmbeddingWithRetry(supabase: any, text: string, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });
      
      if (error) throw new Error(error.message);
      if (!data || !data.embedding) throw new Error("No embedding data returned");
      
      return data.embedding;
    } catch (error) {
      console.warn(`Embedding attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Helper function to calculate baseline quality score
function calculateBaselineQuality(chunk: string, fileName: string, fileType: string): number {
  const factors = getQualityFactors(chunk, fileName, fileType);
  
  // Base score
  let score = 0.7;
  
  // Length factor (optimal range 100-1500 characters)
  const length = chunk.length;
  if (length >= 100 && length <= 1500) {
    score += 0.1;
  } else if (length < 50) {
    score -= 0.2;
  }
  
  // Structure factor
  if (factors.hasHeadings) score += 0.05;
  if (factors.hasList) score += 0.05;
  if (factors.hasCompleteStatements) score += 0.1;
  
  // Content quality factor
  if (factors.readabilityScore > 0.7) score += 0.1;
  if (factors.marketingTerms > 2) score += 0.05;
  
  // File type factor
  if (fileType === 'application/pdf') score += 0.05;
  if (fileName.toLowerCase().includes('guide') || fileName.toLowerCase().includes('manual')) score += 0.05;
  
  // Ensure score stays within bounds
  return Math.max(0.1, Math.min(1.0, score));
}

// Helper function to analyze quality factors
function getQualityFactors(chunk: string, fileName: string, fileType: string) {
  const lines = chunk.split('\n');
  const words = chunk.split(/\s+/).filter(w => w.length > 0);
  const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Check for structural elements
  const hasHeadings = /^#|^\d+\.|^[A-Z][^.!?]*:/.test(chunk);
  const hasList = /^[-*•]\s|^\d+\.\s/m.test(chunk);
  const hasCompleteStatements = sentences.length > 0 && sentences.every(s => s.trim().length > 10);
  
  // Basic readability score (simplified)
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const readabilityScore = avgWordsPerSentence > 5 && avgWordsPerSentence < 25 ? 0.8 : 0.5;
  
  // Marketing terms detection
  const marketingTerms = (chunk.toLowerCase().match(/\b(conversion|roi|cta|engagement|brand|customer|marketing|sales|lead|funnel|campaign|strategy|analytics|target|audience|content|copy|advertising|promotion|revenue|acquisition)\b/g) || []).length;
  
  return {
    hasHeadings,
    hasList,
    hasCompleteStatements,
    readabilityScore,
    marketingTerms,
    wordCount: words.length,
    sentenceCount: sentences.length,
    lineCount: lines.length
  };
}

// Improved PDF content extraction
async function extractPdfContent(file: File): Promise<string> {
  // For now, use basic text extraction
  // In production, you'd want to use a proper PDF parsing library
  const text = await file.text();
  
  // Clean up common PDF artifacts
  return text
    .replace(/\f/g, '\n') // Form feeds to newlines
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Reduce excessive newlines
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters that might be artifacts
    .trim();
}

// Improved DOCX content extraction
async function extractDocxContent(file: File): Promise<string> {
  // For now, use basic text extraction
  // In production, you'd want to use a proper DOCX parsing library
  const text = await file.text();
  
  // Clean up common DOCX artifacts
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Reduce excessive newlines
    .replace(/\t/g, ' ') // Convert tabs to spaces
    .trim();
}

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
