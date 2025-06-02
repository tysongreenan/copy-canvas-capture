
import { supabase } from "@/integrations/supabase/client";
import { ContentProcessor, ProcessingResult } from "./utils/ContentProcessor";

export class ResearchService {
  /**
   * Conduct deep research on a keyword/topic with enhanced error handling
   */
  public static async conductResearch(keyword: string, projectId: string): Promise<ProcessingResult> {
    try {
      if (!keyword?.trim()) {
        return { success: false, message: "Please provide a keyword for research" };
      }

      console.log(`Conducting research on: "${keyword}" for project: ${projectId}`);
      
      // Check for existing research to avoid duplication
      const researchKey = `research_${keyword.toLowerCase().replace(/\s+/g, '_')}`;
      const existingCheck = await ContentProcessor.checkExistingContent(researchKey, projectId);
      
      if (existingCheck.exists && existingCheck.content) {
        console.log(`Research already conducted for: ${keyword}`);
        return {
          success: true,
          contentId: existingCheck.content.id,
          research: existingCheck.content.content,
          chunksProcessed: 0,
          embeddingsGenerated: existingCheck.embeddingCount || 0,
          message: `Research already available for "${keyword}" (cached)`
        };
      }
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No active session");
        return { success: false, message: "Please sign in to continue" };
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("deep-research", {
        body: { 
          keyword: keyword.trim(),
          projectId 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error conducting research:", error);
        return { success: false, message: ContentProcessor.formatError(error) };
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
      return { success: false, message: ContentProcessor.formatError(error) };
    }
  }

  /**
   * Conduct research on multiple keywords with enhanced batch processing
   */
  public static async conductMultipleResearch(
    keywords: string[], 
    projectId: string,
    onProgress?: (current: number, total: number, result?: any) => void
  ): Promise<{ 
    successful: number; 
    failed: number; 
    results: ProcessingResult[];
    totalEmbeddings: number;
  }> {
    let successful = 0;
    let failed = 0;
    let totalEmbeddings = 0;
    const results: ProcessingResult[] = [];

    // Filter and clean keywords
    const validKeywords = keywords
      .filter(keyword => keyword?.trim())
      .map(keyword => keyword.trim())
      .filter((keyword, index, arr) => arr.indexOf(keyword) === index); // Remove duplicates

    if (validKeywords.length !== keywords.length) {
      console.warn(`Filtered out ${keywords.length - validKeywords.length} invalid/duplicate keywords`);
    }

    for (let i = 0; i < validKeywords.length; i++) {
      const keyword = validKeywords[i];
      
      try {
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
          onProgress(i + 1, validKeywords.length, result);
        }

        // Adaptive delay based on success rate
        if (i < validKeywords.length - 1) {
          const delay = failed > successful ? 3000 : 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error researching keyword ${keyword}:`, error);
        failed++;
        results.push({ success: false, message: ContentProcessor.formatError(error) });
        
        if (onProgress) {
          onProgress(i + 1, validKeywords.length, { success: false, message: 'Research failed' });
        }
      }
    }

    return { successful, failed, results, totalEmbeddings };
  }

  /**
   * Research competitors with enhanced context
   */
  public static async researchCompetitor(
    competitorName: string, 
    projectId: string
  ): Promise<ProcessingResult> {
    if (!competitorName?.trim()) {
      return { success: false, message: "Please provide a competitor name" };
    }

    // Create more specific competitor research query
    const competitorKeyword = `${competitorName.trim()} competitor analysis business strategy marketing approach target audience pricing model value proposition strengths weaknesses market position`;
    return this.conductResearch(competitorKeyword, projectId);
  }

  /**
   * Generate research topics for a business with enhanced categorization
   */
  public static generateResearchTopics(businessType: string, category: string): string[] {
    const cleanBusinessType = businessType?.trim() || 'business';
    const cleanCategory = category?.trim() || 'general';
    
    const baseTopics = [
      `${cleanBusinessType} marketing best practices 2024`,
      `${cleanCategory} industry trends analysis`,
      `${cleanBusinessType} customer acquisition strategies`,
      `${cleanBusinessType} digital marketing tactics`,
      `${cleanBusinessType} social media marketing guide`,
      `${cleanBusinessType} email marketing optimization`,
      `${cleanBusinessType} SEO content strategy`,
      `${cleanCategory} competitor landscape analysis`,
      `${cleanBusinessType} pricing strategy research`,
      `${cleanBusinessType} customer retention techniques`,
      `${cleanCategory} market size and opportunities`,
      `${cleanBusinessType} brand positioning strategies`
    ];

    // Add industry-specific topics based on category
    const industrySpecific = this.getIndustrySpecificTopics(cleanCategory, cleanBusinessType);
    
    return [...baseTopics, ...industrySpecific].slice(0, 15); // Limit to 15 topics
  }

  /**
   * Get industry-specific research topics
   */
  private static getIndustrySpecificTopics(category: string, businessType: string): string[] {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('tech') || categoryLower.includes('software')) {
      return [
        `${businessType} user experience optimization`,
        `${businessType} product development lifecycle`,
        `tech startup growth strategies`
      ];
    }
    
    if (categoryLower.includes('retail') || categoryLower.includes('ecommerce')) {
      return [
        `${businessType} conversion rate optimization`,
        `ecommerce customer journey mapping`,
        `retail inventory management strategies`
      ];
    }
    
    if (categoryLower.includes('health') || categoryLower.includes('medical')) {
      return [
        `${businessType} patient engagement strategies`,
        `healthcare digital transformation`,
        `medical practice marketing compliance`
      ];
    }
    
    return [
      `${businessType} operational efficiency`,
      `${category} regulatory compliance`,
      `${businessType} scalability planning`
    ];
  }

  /**
   * Validate research keyword quality
   */
  public static validateKeyword(keyword: string): { valid: boolean; message?: string } {
    if (!keyword?.trim()) {
      return { valid: false, message: "Keyword cannot be empty" };
    }
    
    const trimmed = keyword.trim();
    
    if (trimmed.length < 3) {
      return { valid: false, message: "Keyword must be at least 3 characters long" };
    }
    
    if (trimmed.length > 200) {
      return { valid: false, message: "Keyword must be less than 200 characters" };
    }
    
    return { valid: true };
  }
}
