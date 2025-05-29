
import { supabase } from "@/integrations/supabase/client";

export class ResearchService {
  /**
   * Conduct deep research on a keyword/topic
   */
  public static async conductResearch(keyword: string, projectId: string): Promise<{ 
    success: boolean; 
    contentId?: string;
    research?: string;
    chunksProcessed?: number;
    embeddingsGenerated?: number;
    message?: string;
  }> {
    try {
      console.log(`Conducting research on: "${keyword}" for project: ${projectId}`);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No active session");
        return { success: false, message: "No active session" };
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("deep-research", {
        body: { 
          keyword,
          projectId 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error conducting research:", error);
        return { success: false, message: error.message };
      }
      
      console.log("Research result:", data);
      return {
        success: data?.success === true,
        contentId: data?.contentId,
        research: data?.research,
        chunksProcessed: data?.chunksProcessed,
        embeddingsGenerated: data?.embeddingsGenerated,
        message: data?.message
      };
    } catch (error) {
      console.error("Exception in conductResearch:", error);
      return { success: false, message: "Exception occurred during research" };
    }
  }

  /**
   * Conduct research on multiple keywords
   */
  public static async conductMultipleResearch(
    keywords: string[], 
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

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      
      const result = await this.conductResearch(keyword, projectId);
      results.push(result);
      
      if (result.success) {
        successful++;
        totalEmbeddings += result.embeddingsGenerated || 0;
      } else {
        failed++;
      }
      
      // Update progress
      if (onProgress) {
        onProgress(i + 1, keywords.length, result);
      }

      // Add delay to avoid rate limiting
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds between research
      }
    }

    return { successful, failed, results, totalEmbeddings };
  }

  /**
   * Research competitors
   */
  public static async researchCompetitor(
    competitorName: string, 
    projectId: string
  ): Promise<{ 
    success: boolean; 
    contentId?: string;
    research?: string;
    chunksProcessed?: number;
    embeddingsGenerated?: number;
    message?: string;
  }> {
    // Add specific competitor research context
    const competitorKeyword = `${competitorName} marketing strategy analysis competitor research`;
    return this.conductResearch(competitorKeyword, projectId);
  }

  /**
   * Generate research topics for a business
   */
  public static generateResearchTopics(businessType: string, category: string): string[] {
    const baseTopics = [
      `${businessType} marketing best practices`,
      `${category} industry trends 2024`,
      `${businessType} customer acquisition strategies`,
      `${businessType} social media marketing`,
      `${businessType} email marketing tips`,
      `${businessType} SEO optimization`,
      `${businessType} content marketing strategy`,
      `${category} competitor analysis`
    ];

    return baseTopics;
  }
}
