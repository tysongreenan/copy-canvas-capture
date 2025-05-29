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
    const transcript = `This is a simulated transcript for video ${videoId}. 
    In a production environment, this would contain the actual video transcript 
    extracted using YouTube's API or a third-party service.`;

    // Store the transcript as scraped content
    const { data: contentData, error: contentError } = await supabase
      .from('scraped_content')
      .insert({
        project_id: projectId,
        url: videoUrl,
        title: `YouTube Video: ${videoId}`,
        meta_description: 'YouTube video transcript',
        headings: [{
          tag: 'h1',
          text: `Transcript for ${videoId}`
        }],
        paragraphs: transcript.split('\n').filter(p => p.trim()),
        links: [{
          text: 'Original Video',
          url: videoUrl
        }],
        list_items: [],
        images: [],
        scraped_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contentError) {
      console.error("Error storing content:", contentError);
      throw contentError;
    }

    // Generate embeddings for the transcript
    if (transcript.length > 10) {
      const { error: embeddingError } = await supabase.functions.invoke('process-embeddings', {
        body: {
          projectId,
          contents: [{
            title: `YouTube Video: ${videoId}`,
            url: videoUrl,
            paragraphs: transcript.split('\n').filter(p => p.trim()),
            headings: [],
            links: [],
            listItems: []
          }]
        },
        headers: {
          Authorization: authHeader
        }
      });

      if (embeddingError) {
        console.error("Error generating embeddings:", embeddingError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentId: contentData.id,
        message: `YouTube video processed successfully`
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