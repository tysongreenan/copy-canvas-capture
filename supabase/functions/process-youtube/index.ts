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
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Enhanced function to fetch YouTube transcript using multiple methods
async function fetchYouTubeTranscript(videoId: string): Promise<{ title: string; description: string; transcript: string }> {
  const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  try {
    // Method 1: Use YouTube Data API v3 ONLY for metadata (cost-effective)
    if (youtubeApiKey) {
      console.log("Using YouTube Data API v3 for metadata only (cost optimization)");
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
      );
      
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        if (videoData.items && videoData.items.length > 0) {
          const video = videoData.items[0];
          const title = video.snippet.title;
          const description = video.snippet.description || '';
          
          console.log("✅ Got metadata from API, now trying free transcript extraction");
          
          // 🚀 COST OPTIMIZATION: Skip expensive caption API calls, go straight to free page scraping
          const transcriptResult = await fetchTranscriptFromPageOnly(videoId);
          const transcript = transcriptResult.transcript || "No transcript available for this video.";
          
          return { title, description, transcript };
        }
      }
    }
    
    // Method 2: Fallback to page scraping if API not available
    console.log("Falling back to full page scraping method (free)");
    return await fetchTranscriptFromPageOnly(videoId);
    
  } catch (error) {
    console.error("Error in fetchYouTubeTranscript:", error);
    return await fetchTranscriptFromPageOnly(videoId);
  }
}

// Dedicated function for page scraping only (no API calls)
async function fetchTranscriptFromPageOnly(videoId: string): Promise<{ title: string; description: string; transcript: string }> {
  try {
    console.log(`🆓 Free transcript extraction from page for video: ${videoId}`);
    
    // Fetch the YouTube page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/) || 
                     html.match(/"title":"([^"]+)"/) ||
                     html.match(/property="og:title" content="([^"]+)"/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').replace(/\\u0026/g, '&') : `YouTube Video ${videoId}`;
    
    // Extract description
    const descMatch = html.match(/"shortDescription":"([^"]+)"/) ||
                     html.match(/property="og:description" content="([^"]+)"/);
    let description = '';
    if (descMatch) {
      description = descMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\u0026/g, '&')
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>');
    }
    
    // Extract transcript using multiple free methods
    let transcript = '';
    
    // Method 1: Look for ytInitialPlayerResponse captions
    const captionTrackMatch = html.match(/"captionTracks":\[(.*?)\]/);
    if (captionTrackMatch) {
      try {
        const captionData = `[${captionTrackMatch[1]}]`;
        const captionTracks = JSON.parse(captionData);
        
        // Find English caption track
        const englishTrack = captionTracks.find((track: any) => 
          track.languageCode === 'en' || track.languageCode?.startsWith('en')
        ) || captionTracks[0];
        
        if (englishTrack && englishTrack.baseUrl) {
          const captionUrl = englishTrack.baseUrl.replace(/\\u0026/g, '&');
          transcript = await downloadCaptionFile(captionUrl);
          if (transcript) {
            console.log("✅ Successfully extracted transcript via free method");
          }
        }
      } catch (parseError) {
        console.log("Error parsing caption tracks:", parseError);
      }
    }
    
    // Method 2: Look for alternative caption format
    if (!transcript) {
      const altCaptionMatch = html.match(/"captions":.*?"playerCaptionsTracklistRenderer".*?"captionTracks":\[(.*?)\]/s);
      if (altCaptionMatch) {
        try {
          const trackMatch = altCaptionMatch[1].match(/"baseUrl":"([^"]+)"/);
          if (trackMatch) {
            const captionUrl = trackMatch[1].replace(/\\u0026/g, '&');
            transcript = await downloadCaptionFile(captionUrl);
          }
        } catch (error) {
          console.log("Error with alternative caption extraction:", error);
        }
      }
    }
    
    // Method 3: Look for transcript in page data
    if (!transcript) {
      const transcriptMatch = html.match(/"transcriptRenderer".*?"content".*?"transcriptSearchPanelRenderer"/s);
      if (transcriptMatch) {
        const textMatches = transcriptMatch[0].match(/"text":"([^"]+)"/g);
        if (textMatches) {
          transcript = textMatches
            .map(match => match.replace(/"text":"([^"]+)"/, '$1'))
            .join(' ')
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"');
        }
      }
    }
    
    return {
      title: cleanText(title),
      description: cleanText(description),
      transcript: transcript || "No transcript available for this video."
    };
    
  } catch (error) {
    console.error("Error in fetchTranscriptFromPageOnly:", error);
    return {
      title: `YouTube Video ${videoId}`,
      description: "Unable to extract video details.",
      transcript: "Unable to extract transcript. The video may not have captions available."
    };
  }
}

// Download and parse caption file
async function downloadCaptionFile(captionUrl: string): Promise<string> {
  try {
    const response = await fetch(captionUrl);
    if (!response.ok) return '';
    
    const captionXml = await response.text();
    
    // Parse XML captions
    const textMatches = captionXml.match(/<text[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/text>/g);
    if (textMatches) {
      const transcript = textMatches
        .map(match => {
          // Remove XML tags but keep the text content
          return match
            .replace(/<text[^>]*>/, '')
            .replace(/<\/text>/, '')
            .replace(/<[^>]*>/g, '') // Remove any other XML tags
            .trim();
        })
        .filter(text => text.length > 0)
        .join(' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      return transcript;
    }
    
    return '';
  } catch (error) {
    console.error("Error downloading caption file:", error);
    return '';
  }
}

// Clean text content
function cleanText(text: string): string {
  return text
    .replace(/\\u0026/g, '&')
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\u0027/g, "'")
    .replace(/\\u0022/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .trim();
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

    // 🚀 COST OPTIMIZATION: Check if this video has already been processed
    const { data: existingContent } = await supabase
      .from('scraped_content')
      .select('id, title, content')
      .eq('url', videoUrl)
      .eq('project_id', projectId)
      .single();

    if (existingContent) {
      console.log(`Video already processed: ${existingContent.title}`);
      
      // Count existing embeddings for this content
      const { count: embeddingCount } = await supabase
        .from('content_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .ilike('metadata->source', `%${videoId}%`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          contentId: existingContent.id,
          chunksProcessed: 0,
          embeddingsGenerated: embeddingCount || 0,
          hasTranscript: true, // Assume yes if already processed
          title: existingContent.title,
          message: `Video already processed: "${existingContent.title}" (skipped API call to save costs)`
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Fetch video data with enhanced transcript extraction
    const { title, description, transcript } = await fetchYouTubeTranscript(videoId);
    
    console.log(`Extracted video: ${title}`);
    console.log(`Description length: ${description.length} characters`);
    console.log(`Transcript length: ${transcript.length} characters`);

    // Combine all content
    const fullContent = `${title}\n\n${description}\n\nTranscript:\n${transcript}`;

    // Store the content as scraped content
    const { data: contentData, error: contentError } = await supabase
      .from('scraped_content')
      .insert({
        project_id: projectId,
        url: videoUrl,
        title: title,
        content: {
          meta_description: description.substring(0, 160), // Limit meta description
          headings: [{
            tag: 'h1',
            text: title
          }],
          paragraphs: [description, `Transcript: ${transcript}`].filter(p => p.trim()),
          links: [{
            text: 'Watch on YouTube',
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

    // Split content into chunks and generate embeddings
    const chunks = splitTextIntoChunks(fullContent);
    console.log(`Split content into ${chunks.length} chunks`);

    // Process each chunk for embeddings
    let successfulEmbeddings = 0;
    
    for (const chunk of chunks) {
      try {
        const { error: embeddingError } = await supabase.functions.invoke('process-embeddings', {
          body: {
            text: chunk,
            projectId: projectId,
            metadata: {
              type: 'youtube_video',
              title: title,
              source: videoUrl,
              video_id: videoId,
              has_transcript: transcript !== "No transcript available for this video."
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
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
        hasTranscript: transcript !== "No transcript available for this video.",
        title: title,
        message: `YouTube video "${title}" processed successfully with ${successfulEmbeddings} embeddings generated`
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
        success: false,
        error: error.message || "Failed to process YouTube video"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
