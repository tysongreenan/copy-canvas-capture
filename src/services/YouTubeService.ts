import { supabase } from "@/integrations/supabase/client";

export class YouTubeService {
  /**
   * Process a YouTube video by extracting its transcript
   */
  public static async processVideo(videoUrl: string, projectId: string): Promise<boolean> {
    try {
      console.log(`Processing YouTube video: ${videoUrl} for project: ${projectId}`);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No active session");
        return false;
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
        return false;
      }
      
      console.log("YouTube processing result:", data);
      return data?.success === true;
    } catch (error) {
      console.error("Exception in processVideo:", error);
      return false;
    }
  }

  /**
   * Process multiple YouTube videos
   */
  public static async processMultipleVideos(
    videoUrls: string[], 
    projectId: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];
      
      // Update progress
      if (onProgress) {
        onProgress(i + 1, videoUrls.length);
      }

      const success = await this.processVideo(videoUrl, projectId);
      if (success) {
        successful++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      if (i < videoUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { successful, failed };
  }

  /**
   * Validate YouTube URL
   */
  public static isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      /youtube\.com\/watch\?v=[\w-]+/,
      /youtu\.be\/[\w-]+/,
      /youtube\.com\/embed\/[\w-]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL
   */
  public static extractVideoId(url: string): string | null {
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
} 