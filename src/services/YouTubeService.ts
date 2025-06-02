
import { supabase } from "@/integrations/supabase/client";
import { EmbeddingUtils } from "./utils/EmbeddingUtils";
import { ContentProcessor, ProcessingResult } from "./utils/ContentProcessor";

export class YouTubeService {
  /**
   * Process a YouTube video by extracting its transcript
   */
  public static async processVideo(videoUrl: string, projectId: string): Promise<ProcessingResult> {
    try {
      console.log(`Processing YouTube video: ${videoUrl} for project: ${projectId}`);
      
      // Validate URL first
      if (!this.isValidYouTubeUrl(videoUrl)) {
        return { success: false, message: "Please provide a valid YouTube video URL" };
      }

      // Check for existing content to avoid reprocessing
      const existingCheck = await ContentProcessor.checkExistingContent(videoUrl, projectId);
      if (existingCheck.exists && existingCheck.content) {
        console.log(`Video already processed: ${existingCheck.content.title}`);
        return {
          success: true,
          contentId: existingCheck.content.id,
          chunksProcessed: 0,
          embeddingsGenerated: existingCheck.embeddingCount || 0,
          hasTranscript: true,
          title: existingCheck.content.title,
          message: `Video already processed: "${existingCheck.content.title}" (cached)`
        };
      }
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No active session");
        return { success: false, message: "Please sign in to continue" };
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("process-youtube", {
        body: { 
          videoUrl: this.formatVideoUrl(videoUrl),
          projectId 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error processing YouTube video:", error);
        return { success: false, message: ContentProcessor.formatError(error) };
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
      return { success: false, message: ContentProcessor.formatError(error) };
    }
  }

  /**
   * Process multiple YouTube videos with enhanced progress tracking
   */
  public static async processMultipleVideos(
    videoUrls: string[], 
    projectId: string,
    onProgress?: (current: number, total: number, result?: any) => void
  ): Promise<{ 
    successful: number; 
    failed: number; 
    results: ProcessingResult[];
    totalEmbeddings: number;
    videosWithTranscripts: number;
  }> {
    let successful = 0;
    let failed = 0;
    let totalEmbeddings = 0;
    let videosWithTranscripts = 0;
    const results: ProcessingResult[] = [];

    // Filter out invalid URLs upfront
    const validUrls = videoUrls.filter(url => this.isValidYouTubeUrl(url));
    
    if (validUrls.length !== videoUrls.length) {
      console.warn(`Filtered out ${videoUrls.length - validUrls.length} invalid URLs`);
    }

    for (let i = 0; i < validUrls.length; i++) {
      const videoUrl = validUrls[i];
      
      try {
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
          onProgress(i + 1, validUrls.length, result);
        }

        // Add delay to avoid rate limiting - adaptive delay based on success rate
        if (i < validUrls.length - 1) {
          const delay = failed > successful ? 3000 : 1500; // Longer delay if many failures
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error processing video ${videoUrl}:`, error);
        failed++;
        results.push({ success: false, message: ContentProcessor.formatError(error) });
        
        if (onProgress) {
          onProgress(i + 1, validUrls.length, { success: false, message: 'Processing failed' });
        }
      }
    }

    return { successful, failed, results, totalEmbeddings, videosWithTranscripts };
  }

  /**
   * Validate YouTube URL (enhanced with more formats)
   */
  public static isValidYouTubeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      /youtube\.com\/watch\?v=[\w-]+/,
      /youtu\.be\/[\w-]+/,
      /youtube\.com\/embed\/[\w-]+/,
      /youtube\.com\/shorts\/[\w-]+/,
      /youtube\.com\/v\/[\w-]+/,
      /youtube\.com\/playlist\?list=[\w-]+/ // Support playlists
    ];
    
    return patterns.some(pattern => pattern.test(url.trim()));
  }

  /**
   * Extract video ID from YouTube URL (enhanced)
   */
  public static extractVideoId(url: string): string | null {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  /**
   * Get video type from URL
   */
  public static getVideoType(url: string): 'video' | 'short' | 'playlist' | 'unknown' {
    if (!url) return 'unknown';
    
    if (url.includes('/shorts/')) return 'short';
    if (url.includes('/playlist?')) return 'playlist';
    if (url.includes('/watch?v=') || url.includes('youtu.be/') || url.includes('/embed/')) return 'video';
    return 'unknown';
  }

  /**
   * Format video URL for consistent processing
   */
  public static formatVideoUrl(url: string): string {
    if (!url) return url;
    
    const videoId = this.extractVideoId(url.trim());
    if (!videoId) return url;
    
    // Convert all URLs to standard watch format for consistent processing
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Get video metadata without processing
   */
  public static async getVideoMetadata(videoUrl: string): Promise<{
    title?: string;
    duration?: string;
    viewCount?: string;
    publishedAt?: string;
  } | null> {
    try {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) return null;

      // This could be enhanced to call YouTube API for metadata
      // For now, return basic info that can be extracted from URL
      return {
        title: `YouTube Video ${videoId}`,
        duration: 'Unknown',
        viewCount: 'Unknown',
        publishedAt: 'Unknown'
      };
    } catch (error) {
      console.error('Error getting video metadata:', error);
      return null;
    }
  }
}
