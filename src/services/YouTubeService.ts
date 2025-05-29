
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
  }> {
    let successful = 0;
    let failed = 0;
    let totalEmbeddings = 0;
    const results: any[] = [];

    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];
      
      const result = await this.processVideo(videoUrl, projectId);
      results.push(result);
      
      if (result.success) {
        successful++;
        totalEmbeddings += result.embeddingsGenerated || 0;
      } else {
        failed++;
      }

      // Update progress
      if (onProgress) {
        onProgress(i + 1, videoUrls.length, result);
      }

      // Add delay to avoid rate limiting
      if (i < videoUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { successful, failed, results, totalEmbeddings };
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
