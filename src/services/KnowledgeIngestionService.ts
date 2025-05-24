
import { GlobalKnowledgeService } from "./GlobalKnowledgeService";

export interface MarketingResource {
  url: string;
  title: string;
  author?: string;
  source: string;
  contentType: string;
  marketingDomain: string;
  complexityLevel: string;
  description?: string;
  authorityScore: number;
}

export class KnowledgeIngestionService {
  /**
   * Predefined list of high-quality marketing resources to ingest
   */
  private static readonly MARKETING_RESOURCES: MarketingResource[] = [
    {
      url: "https://growthsummary.com/scientific-advertising",
      title: "Scientific Advertising - Core Principles",
      author: "Claude Hopkins",
      source: "Claude Hopkins - Scientific Advertising",
      contentType: "principle",
      marketingDomain: "copywriting",
      complexityLevel: "intermediate",
      description: "Foundational principles of advertising from the 1923 classic",
      authorityScore: 0.95
    },
    {
      url: "https://copyblogger.com/copywriting-101/",
      title: "Copywriting 101 Series",
      author: "Copyblogger",
      source: "Copyblogger - Copywriting 101",
      contentType: "guide",
      marketingDomain: "copywriting",
      complexityLevel: "beginner",
      description: "Comprehensive copywriting fundamentals and techniques",
      authorityScore: 0.85
    },
    {
      url: "https://blog.hubspot.com/marketing/website-copywriting-tips",
      title: "Website Copywriting Tips",
      author: "HubSpot",
      source: "HubSpot - Website Copywriting Guide",
      contentType: "guide",
      marketingDomain: "copywriting",
      complexityLevel: "beginner",
      description: "Modern web copywriting best practices for conversions",
      authorityScore: 0.80
    }
  ];

  /**
   * Process and ingest marketing knowledge from curated resources
   */
  public static async ingestMarketingKnowledge(): Promise<boolean> {
    try {
      let successCount = 0;
      
      for (const resource of this.MARKETING_RESOURCES) {
        console.log(`Processing resource: ${resource.title}`);
        
        // Add the knowledge source first
        const sourceId = await GlobalKnowledgeService.addKnowledgeSource(
          resource.title,
          resource.contentType,
          resource.author,
          resource.url,
          resource.description,
          resource.authorityScore
        );

        if (!sourceId) {
          console.error(`Failed to add knowledge source: ${resource.title}`);
          continue;
        }

        // For now, we'll add some sample content for each resource
        // In a real implementation, you'd crawl and extract the actual content
        const sampleContent = await this.generateSampleContent(resource);
        
        for (const content of sampleContent) {
          const knowledgeId = await GlobalKnowledgeService.addKnowledge(
            content.text,
            content.title,
            resource.source,
            resource.contentType,
            resource.marketingDomain,
            resource.complexityLevel,
            content.tags,
            {
              url: resource.url,
              author: resource.author,
              section: content.section
            }
          );

          if (knowledgeId) {
            successCount++;
          }
        }
      }

      console.log(`Successfully ingested ${successCount} knowledge pieces`);
      return successCount > 0;
    } catch (error) {
      console.error("Error ingesting marketing knowledge:", error);
      return false;
    }
  }

  /**
   * Generate sample content for marketing resources
   * In production, this would be replaced with actual web crawling
   */
  private static async generateSampleContent(resource: MarketingResource): Promise<Array<{
    title: string;
    text: string;
    tags: string[];
    section: string;
  }>> {
    const content = [];

    if (resource.author === "Claude Hopkins") {
      content.push({
        title: "Hopkins' Principle: Reason Why",
        text: "Every advertisement should give the consumer a reason why they should buy. Hopkins emphasized that successful advertising must provide logical justification for the purchase decision. 'The time has come when advertising has in some hands reached the status of a science. It is based on fixed principles and is reasonably exact.' Always test your reasons and measure results.",
        tags: ["reason-why", "testing", "scientific-advertising", "principles"],
        section: "Core Principles"
      });
      
      content.push({
        title: "Hopkins' Testing Philosophy",
        text: "Hopkins pioneered the concept of split testing in advertising. 'Almost any question can be answered, cheaply, quickly and finally, by a test campaign. And that's the way to answer them—not by arguments around a table.' He believed that data should drive decisions, not opinions or creativity alone.",
        tags: ["testing", "split-testing", "data-driven", "measurement"],
        section: "Testing Methods"
      });
    }

    if (resource.source.includes("Copyblogger")) {
      content.push({
        title: "AIDA Framework Application",
        text: "AIDA (Attention, Interest, Desire, Action) remains one of the most effective copywriting formulas. Attention: Use compelling headlines. Interest: Present intriguing information. Desire: Show benefits and social proof. Action: Include clear, specific calls-to-action. This formula works across all mediums from ads to emails to landing pages.",
        tags: ["AIDA", "framework", "copywriting", "headlines", "CTA"],
        section: "Copywriting Formulas"
      });

      content.push({
        title: "The Power of Specificity",
        text: "Specific claims are more believable and memorable than vague generalizations. Instead of 'many customers love us,' say 'over 10,000 customers in 50 countries.' Instead of 'fast results,' say 'see results in 7 days or less.' Specificity builds credibility and makes your copy more persuasive.",
        tags: ["specificity", "credibility", "persuasion", "social-proof"],
        section: "Writing Techniques"
      });
    }

    if (resource.source.includes("HubSpot")) {
      content.push({
        title: "Modern Website Copy Best Practices",
        text: "Effective website copy must be scannable, benefit-focused, and action-oriented. Use short paragraphs, bullet points, and subheadings. Focus on what the visitor will gain, not what your company does. Every page should have a clear primary call-to-action. Test different versions to optimize conversion rates.",
        tags: ["website-copy", "UX", "conversion", "benefits", "CTA"],
        section: "Web Copywriting"
      });

      content.push({
        title: "Converting Visitors to Leads",
        text: "The key to conversion is understanding your visitor's mindset and meeting them where they are. Provide value first through helpful content, build trust with social proof and testimonials, reduce friction in your forms, and use urgency or scarcity when appropriate. Always A/B test your conversion elements.",
        tags: ["conversion", "lead-generation", "trust", "social-proof", "testing"],
        section: "Conversion Optimization"
      });
    }

    return content;
  }

  /**
   * Process external marketing content (for future implementation)
   */
  public static async processExternalContent(
    url: string,
    source: string,
    contentType: string,
    marketingDomain: string
  ): Promise<boolean> {
    // Future implementation would:
    // 1. Crawl the URL
    // 2. Extract and clean content
    // 3. Chunk the content intelligently
    // 4. Generate embeddings
    // 5. Store in global_knowledge table
    
    console.log(`Future implementation: Process content from ${url}`);
    return true;
  }
}
