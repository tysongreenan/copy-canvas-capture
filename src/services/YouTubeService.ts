import { supabase } from "@/integrations/supabase/client";

export class YouTubeService {
  /**
   * Process a YouTube video by extracting its transcript
   */
  public static async processVideo(videoUrl: string, projectId: string): Promise<{
    success: boolean;
    contentId?: string;
    chunksProcessed?: number;
    embeddingsGenerated?: number;
    hasTranscript?: boolean;
    title?: string;
    message?: string;
  }> {
    try {
      console.log(`Processing YouTube video: ${videoUrl} for project: ${projectId}`);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No active session");
        return { success: false, message: "No active session" };
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("process-youtube", {
        body: { 
          videoUrl,
          projectId 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error processing YouTube video:", error);
        return { success: false, message: error.message };
      }
      
      console.log("YouTube processing result:", data);
      return {
        success: data?.success === true,
        contentId: data?.contentId,
        chunksProcessed: data?.chunksProcessed,
        embeddingsGenerated: data?.embeddingsGenerated,
        hasTranscript: data?.hasTranscript,
        title: data?.title,
        message: data?.message
      };
    } catch (error) {
      console.error("Exception in processVideo:", error);
      return { success: false, message: "Exception occurred during processing" };
    }
  }

  /**
   * Process multiple YouTube videos
   */
  public static async processMultipleVideos(
    videoUrls: string[], 
    projectId: string,
    onProgress?: (current: number, total: number, result?: any) => void
  ): Promise<{ 
    successful: number; 
    failed: number; 
    results: any[];
    totalEmbeddings: number;
    videosWithTranscripts: number;
  }> {
    let successful = 0;
    let failed = 0;
    let totalEmbeddings = 0;
    let videosWithTranscripts = 0;
    const results: any[] = [];

    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];
      
      const result = await this.processVideo(videoUrl, projectId);
      results.push(result);
      
      if (result.success) {
        successful++;
        totalEmbeddings += result.embeddingsGenerated || 0;
        if (result.hasTranscript) {
          videosWithTranscripts++;
        }
      } else {
        failed++;
      }

      // Update progress
      if (onProgress) {
        onProgress(i + 1, videoUrls.length, result);
      }

      // Add delay to avoid rate limiting (YouTube API rate limits)
      if (i < videoUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { successful, failed, results, totalEmbeddings, videosWithTranscripts };
  }

  /**
   * Validate YouTube URL (updated to support more formats)
   */
  public static isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      /youtube\.com\/watch\?v=[\w-]+/,
      /youtu\.be\/[\w-]+/,
      /youtube\.com\/embed\/[\w-]+/,
      /youtube\.com\/shorts\/[\w-]+/, // Added support for YouTube Shorts
      /youtube\.com\/v\/[\w-]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL (updated for Shorts support)
   */
  public static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/, // Added support for YouTube Shorts
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  /**
   * Get video type from URL
   */
  public static getVideoType(url: string): 'video' | 'short' | 'unknown' {
    if (url.includes('/shorts/')) return 'short';
    if (url.includes('/watch?v=') || url.includes('youtu.be/') || url.includes('/embed/')) return 'video';
    return 'unknown';
  }

  /**
   * Format video URL for consistent processing
   */
  public static formatVideoUrl(url: string): string {
    const videoId = this.extractVideoId(url);
    if (!videoId) return url;
    
    // Convert all URLs to standard watch format for consistent processing
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
