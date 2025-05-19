
// Make sure ScraperService imports types from ScraperTypes
import { ScrapedContent, CrawlProject, SitemapData, CrawlOptions } from './ScraperTypes';
import { v4 as uuidv4 } from 'uuid';
import { ProjectService } from './ProjectService';
import { SitemapService } from './SitemapService';
import { BrowserScraper } from './BrowserScraper';
import { EmbeddingService } from './EmbeddingService';
import { supabase } from "@/integrations/supabase/client";

export class ScraperService {
  private static results: ScrapedContent[] = [];
  private static currentProject: CrawlProject | null = null;
  private static baseUrl: string = '';
  private static baseDomain: string = '';
  private static isCrawling: boolean = false;
  private static generateEmbeddings: boolean = false;
  
  /**
   * Main method to scrape a website (single page or crawl)
   */
  public static async scrapeWebsite(url: string, options: CrawlOptions): Promise<ScrapedContent | null> {
    this.generateEmbeddings = options.generateEmbeddings || false;
    
    if (options.crawlEntireSite) {
      this.isCrawling = true;
      await this.crawlSite(url, options);
      this.isCrawling = false;
      
      // Return the first result as the main content
      return this.results.length > 0 ? this.results[0] : null;
    } else {
      // Single page scrape
      const result = await this.scrapeContent(url);
      this.results = [result]; // Store for potential access later
      
      // If embeddings are enabled, process the page
      if (this.generateEmbeddings && result.projectId) {
        await EmbeddingService.processContent(result, result.projectId);
      }
      
      return result;
    }
  }
  
  /**
   * Stop an ongoing crawling process
   */
  public static stopCrawling(): void {
    this.isCrawling = false;
  }
  
  /**
   * Get all results from the last scrape operation
   */
  public static getAllResults(): ScrapedContent[] {
    return this.results;
  }
  
  /**
   * Scrape content from a single page
   */
  public static async scrapeContent(url: string): Promise<ScrapedContent> {
    return BrowserScraper.scrapeUrl(url);
  }
  
  /**
   * Crawl an entire site
   */
  public static async crawlSite(startUrl: string, options: CrawlOptions): Promise<ScrapedContent[]> {
    this.results = []; // Reset results for a new crawl
    this.isCrawling = true;
    
    // Set base URL and domain for the project
    this.baseUrl = startUrl;
    try {
      this.baseDomain = new URL(startUrl).hostname;
    } catch (error) {
      console.error("Invalid URL:", startUrl);
      return [];
    }
    
    const projectId = uuidv4();
    
    // Create a new project
    const projectName = options.projectName || ProjectService.getProjectNameFromUrl(startUrl);
    this.currentProject = ProjectService.createProject(projectId, projectName, startUrl);
    
    let visited = new Set<string>();
    let queue: string[] = [startUrl];
    let pageCount = 0;
    
    while (queue.length > 0 && this.isCrawling && (options.crawlEntireSite || (options.maxPages && pageCount < options.maxPages))) {
      const url = queue.shift()!;
      
      if (visited.has(url)) continue;
      visited.add(url);
      
      console.log(`Crawling ${url}`);
      const content = await this.scrapeContent(url);
      content.projectId = projectId; // Assign the project ID to the content
      this.results.push(content);
      pageCount++;
      
      // Process embeddings for this page if enabled
      if (this.generateEmbeddings) {
        console.log(`Generating embeddings for ${url}`);
        await EmbeddingService.processContent(content, projectId);
      }
      
      // Extract and enqueue links, only if crawlEntireSite is true
      if (options.crawlEntireSite) {
        const links = content.links.map(link => link.url);
        for (const link of links) {
          try {
            const linkUrl = new URL(link);
            // Only crawl links within the same domain
            if (linkUrl.hostname === this.baseDomain && !visited.has(link)) {
              queue.push(link);
            }
          } catch (error) {
            console.error("Invalid URL:", link);
          }
        }
      }
    }
    
    // Update project page count
    ProjectService.updateProjectPageCount(projectId, pageCount);
    
    // Generate sitemap data
    ProjectService.updateProjectSitemap(
      projectId, 
      this.results,
      startUrl,
      this.baseUrl,
      this.baseDomain
    );
    
    this.isCrawling = false;
    return this.results;
  }
  
  /**
   * Get results by project ID
   */
  public static getResultsByProject(projectId: string): ScrapedContent[] {
    return this.results.filter(result => result.projectId === projectId);
  }
  
  /**
   * Get the current project
   */
  public static getCurrentProject(): CrawlProject | null {
    return this.currentProject;
  }
  
  /**
   * Get base URL
   */
  public static getBaseUrl(): string {
    return this.baseUrl;
  }
  
  /**
   * Get base domain
   */
  public static getBaseDomain(): string {
    return this.baseDomain;
  }
}
