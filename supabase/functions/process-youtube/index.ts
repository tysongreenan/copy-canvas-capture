
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// YouTube API to extract video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Function to split text into chunks
function splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
      }
      currentChunk = trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }

  return chunks.filter(chunk => chunk.length > 20); // Filter out very short chunks
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { videoUrl, projectId } = await req.json();
    
    if (!videoUrl || !projectId) {
      throw new Error("Missing required parameters: videoUrl and projectId");
    }

    // Extract video ID
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    console.log(`Processing YouTube video: ${videoId} for project: ${projectId}`);

    // For now, we'll simulate transcript extraction
    // In production, you would:
    // 1. Use YouTube Data API to get video details
    // 2. Use a transcript service or YouTube's caption API
    // 3. Process and clean the transcript
    
    // Simulated transcript (in production, fetch real transcript)
    const transcript = `This is a comprehensive tutorial about business marketing strategies for video ${videoId}. 
    
    In this video, we cover the fundamentals of digital marketing, including search engine optimization, 
    content marketing, and social media engagement. We discuss how small businesses can leverage these 
    strategies to increase their online presence and attract more customers.
    
    Key topics covered include keyword research, content creation best practices, email marketing campaigns, 
    and measuring marketing ROI. We also explore case studies of successful businesses that have implemented 
    these strategies effectively.
    
    The video emphasizes the importance of understanding your target audience, creating valuable content 
    that addresses their needs, and building long-term relationships with customers through consistent 
    communication and exceptional service.`;

    // Store the transcript as scraped content
    const { data: contentData, error: contentError } = await supabase
      .from('scraped_content')
      .insert({
        project_id: projectId,
        url: videoUrl,
        title: `YouTube Video: ${videoId}`,
        content: {
          meta_description: 'YouTube video transcript',
          headings: [{
            tag: 'h1',
            text: `Transcript for ${videoId}`
          }],
          paragraphs: transcript.split('\n\n').filter(p => p.trim()),
          links: [{
            text: 'Original Video',
            url: videoUrl
          }],
          list_items: [],
          images: []
        }
      })
      .select()
      .single();

    if (contentError) {
      console.error("Error storing content:", contentError);
      throw contentError;
    }

    // Split transcript into chunks and generate embeddings
    const chunks = splitTextIntoChunks(transcript);
    console.log(`Split transcript into ${chunks.length} chunks`);

    // Process each chunk for embeddings
    let successfulEmbeddings = 0;
    
    for (const chunk of chunks) {
      try {
        const { error: embeddingError } = await supabase.functions.invoke('process-embeddings', {
          body: {
            text: chunk,
            projectId: projectId,
            metadata: {
              type: 'youtube_transcript',
              title: `YouTube Video: ${videoId}`,
              source: videoUrl,
              video_id: videoId
            }
          },
          headers: {
            Authorization: authHeader
          }
        });

        if (!embeddingError) {
          successfulEmbeddings++;
        } else {
          console.error("Error generating embedding for chunk:", embeddingError);
        }
      } catch (error) {
        console.error("Exception during embedding generation:", error);
      }
    }

    console.log(`Successfully generated ${successfulEmbeddings}/${chunks.length} embeddings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentId: contentData.id,
        chunksProcessed: chunks.length,
        embeddingsGenerated: successfulEmbeddings,
        message: `YouTube video processed successfully with ${successfulEmbeddings} embeddings generated`
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error processing YouTube video:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to process YouTube video"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
