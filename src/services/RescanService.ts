
import { ScraperService } from './ScraperService';
import { ContentComparisonService, ContentComparison } from './ContentComparisonService';
import { ContentService } from './ContentService';
import { EmbeddingService } from './EmbeddingService';
import { ScrapedContent } from './ScraperTypes';
import { toast } from '@/hooks/use-toast';

export interface RescanResults {
  comparison: ContentComparison;
  projectId: string;
  projectTitle: string;
  baseUrl: string;
}

export interface RescanOptions {
  onlyProcessNewContent?: boolean;
  forceReprocessAll?: boolean;
  projectId: string;
  generateEmbeddings: boolean;
  maxPages?: number;
}

export class RescanService {
  /**
   * Rescan an existing project to check for content changes
   */
  public static async rescanProject(
    projectId: string, 
    options: RescanOptions
  ): Promise<RescanResults | null> {
    try {
      // Get the project and its content
      const project = await ContentService.getProjectById(projectId);
      if (!project) {
        toast({
          title: "Project not found",
          description: "Could not find the project to rescan",
          variant: "destructive"
        });
        return null;
      }
      
      // Get existing pages
      const existingPages = await ContentService.getProjectPages(projectId);
      if (!existingPages || existingPages.length === 0) {
        toast({
          title: "No content to compare",
          description: "This project has no pages to compare against",
          variant: "destructive"
        });
        return null;
      }
      
      // Convert database pages to ScrapedContent format
      const existingContent: ScrapedContent[] = existingPages.map(page => {
        const contentObj = page.content as any;
        return {
          url: page.url,
          title: page.title || "",
          headings: contentObj.headings || [],
          paragraphs: contentObj.paragraphs || [],
          links: contentObj.links || [],
          listItems: contentObj.listItems || [],
          metaDescription: contentObj.metaDescription || null,
          metaKeywords: contentObj.metaKeywords || null,
          projectId
        };
      });
      
      // Rescrap the website
      const scrapOptions = {
        crawlEntireSite: true,
        maxPages: options.maxPages || existingContent.length + 10,
        generateEmbeddings: false, // We'll handle embeddings manually later
        useExistingProjectId: projectId
      };
      
      await ScraperService.scrapeWebsite(project.url, scrapOptions);
      const newlyScrapedContent = ScraperService.getAllResults();
      
      // Compare the content
      const comparison = ContentComparisonService.compareContent(
        existingContent,
        newlyScrapedContent
      );
      
      // Process embeddings based on options
      if (options.generateEmbeddings) {
        let contentToProcess: ScrapedContent[] = [];
        
        if (options.forceReprocessAll) {
          // Process all content
          contentToProcess = newlyScrapedContent;
          console.log(`Processing embeddings for all ${contentToProcess.length} pages`);
        } else {
          // Only process new and changed content
          contentToProcess = [
            ...comparison.newContent,
            ...comparison.changedContent
          ];
          console.log(`Processing embeddings for ${contentToProcess.length} new/changed pages`);
        }
        
        if (contentToProcess.length > 0) {
          await EmbeddingService.processProject(projectId, contentToProcess);
        }
      }
      
      return {
        comparison,
        projectId,
        projectTitle: project.title,
        baseUrl: project.url
      };
      
    } catch (error) {
      console.error("Error during rescan:", error);
      toast({
        title: "Rescan failed",
        description: error instanceof Error ? error.message : "An error occurred during rescan",
        variant: "destructive"
      });
      return null;
    }
  }
}
