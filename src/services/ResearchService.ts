import { supabase } from "@/integrations/supabase/client";

export class ResearchService {
  /**
   * Conduct deep research on a keyword/topic
   */
  public static async conductResearch(keyword: string, projectId: string): Promise<{ 
    success: boolean; 
    contentId?: string;
    research?: string;
  }> {
    try {
      console.log(`Conducting research on: "${keyword}" for project: ${projectId}`);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No active session");
        return { success: false };
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
        return { success: false };
      }
      
      console.log("Research result:", data);
      return {
        success: data?.success === true,
        contentId: data?.contentId,
        research: data?.research
      };
    } catch (error) {
      console.error("Exception in conductResearch:", error);
      return { success: false };
    }
  }

  /**
   * Conduct research on multiple keywords
   */
  public static async conductMultipleResearch(
    keywords: string[], 
    projectId: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      
      // Update progress
      if (onProgress) {
        onProgress(i + 1, keywords.length);
      }

      const result = await this.conductResearch(keyword, projectId);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds between research
      }
    }

    return { successful, failed };
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