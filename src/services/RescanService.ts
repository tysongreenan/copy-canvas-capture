
import { ScraperService } from './ScraperService';
import { ContentService } from './ContentService';
import type { ScrapedContent } from './ScraperTypes';

// Types for rescan options
export interface RescanOptions {
  projectId: string;
  generateEmbeddings: boolean;
  onlyProcessNewContent: boolean;
  maxPages: number;
}

// Types for rescan results
export interface RescanResults {
  projectId: string;
  startUrl: string;
  comparison: {
    newContent: ScrapedContent[];
    changedContent: ScrapedContent[];
    unchangedContent: ScrapedContent[];
    removedUrls: string[];
  }
}

export class RescanService {
  /**
   * Rescan a project to check for new or updated content
   */
  public static async rescanProject(projectId: string, options: RescanOptions): Promise<RescanResults | null> {
    try {
      // First, get the project information
      const project = await ContentService.getProjectById(projectId);
      if (!project) {
        console.error("Project not found for rescan:", projectId);
        return null;
      }
      
      // Then get all existing project pages
      const existingPages = await ContentService.getProjectPages(projectId);
      
      // Create a map of existing URLs to compare later
      const existingUrlMap = new Map();
      existingPages.forEach(page => {
        existingUrlMap.set(page.url, {
          id: page.id,
          title: page.title,
          content: page.content
        });
      });
      
      // Rescan the site
      await ScraperService.scrapeWebsite(project.url, {
        crawlEntireSite: true,
        maxPages: options.maxPages,
        generateEmbeddings: options.generateEmbeddings,
        useExistingProjectId: projectId
      });
      
      // Get all the new scanned results
      const newScannedResults = ScraperService.getAllResults();
      
      // Categorize results
      const newContent: ScrapedContent[] = [];
      const changedContent: ScrapedContent[] = [];
      const unchangedContent: ScrapedContent[] = [];
      const removedUrls: string[] = [];
      
      // First, identify new and changed content
      newScannedResults.forEach(result => {
        const existingPage = existingUrlMap.get(result.url);
        if (!existingPage) {
          newContent.push(result);
        } else {
          // This is a rough comparison - would need better comparison logic
          // for a real production implementation
          const oldContentJson = JSON.stringify(existingPage.content);
          const newContentJson = JSON.stringify({
            headings: result.headings,
            paragraphs: result.paragraphs,
            links: result.links,
            listItems: result.listItems,
            metaDescription: result.metaDescription,
            metaKeywords: result.metaKeywords
          });
          
          if (oldContentJson !== newContentJson) {
            changedContent.push(result);
          } else {
            unchangedContent.push(result);
          }
          
          // Remove from map to track removed URLs later
          existingUrlMap.delete(result.url);
        }
      });
      
      // Any URLs left in the map are no longer found in the site
      existingUrlMap.forEach((value, key) => {
        removedUrls.push(key);
      });
      
      // Save to database - for new and changed content
      if (newContent.length > 0 || changedContent.length > 0) {
        // Filter which content to process based on options
        const contentToUpdate = [...newContent];
        if (!options.onlyProcessNewContent) {
          contentToUpdate.push(...changedContent);
        }
        
        if (contentToUpdate.length > 0) {
          // Save to database
          await ContentService.saveProject(project.title, project.url, contentToUpdate);
        }
      }
      
      return {
        projectId,
        startUrl: project.url,
        comparison: {
          newContent,
          changedContent,
          unchangedContent,
          removedUrls
        }
      };
    } catch (error) {
      console.error("Error during project rescan:", error);
      return null;
    }
  }
}
