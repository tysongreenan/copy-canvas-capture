
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export interface ScrapedContent {
  url: string;
  title: string;
  headings: {
    text: string;
    tag: string;
  }[];
  paragraphs: string[];
  links: {
    text: string;
    url: string;
  }[];
  listItems: string[];
  metaDescription: string | null;
  metaKeywords: string | null;
  projectId?: string; // Project identifier
}

export interface CrawlProject {
  id: string;
  name: string;
  startUrl: string;
  createdAt: Date;
  pageCount: number;
}

export interface CrawlOptions {
  crawlEntireSite: boolean;
  maxPages?: number;
  projectName?: string;
}

export class ScraperService {
  private static visited: Set<string> = new Set();
  private static queue: string[] = [];
  private static results: ScrapedContent[] = [];
  private static baseUrl: string = '';
  private static baseDomain: string = '';
  private static isCrawling: boolean = false;
  private static maxPages: number = 10; // Default limit
  private static currentProjectId: string = '';
  private static projects: CrawlProject[] = [];
  
  static async scrapeWebsite(url: string, options?: CrawlOptions): Promise<ScrapedContent | null> {
    try {
      // Add https:// if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid website URL",
          variant: "destructive"
        });
        return null;
      }

      // Generate a new project ID for this crawl session
      this.currentProjectId = uuidv4();
      const projectName = options?.projectName || this.getProjectNameFromUrl(url);
      const newProject: CrawlProject = {
        id: this.currentProjectId,
        name: projectName,
        startUrl: url,
        createdAt: new Date(),
        pageCount: 0
      };
      this.projects.push(newProject);

      // If not crawling the entire site, just scrape the single page
      if (!options?.crawlEntireSite) {
        const singlePageResult = await this.scrapeSinglePage(url);
        if (singlePageResult) {
          singlePageResult.projectId = this.currentProjectId;
          this.results = [singlePageResult];
          
          // Update the project page count
          this.updateProjectPageCount(this.currentProjectId, 1);
          
          toast({
            title: "Scrape Complete",
            description: `Successfully scraped page: ${singlePageResult.title || url}`,
          });
        }
        return singlePageResult;
      }
      
      // If already crawling, don't start another crawl
      if (this.isCrawling) {
        toast({
          title: "Crawl in Progress",
          description: "Please wait for the current crawl to complete",
          variant: "destructive"
        });
        return null;
      }
      
      // Initialize crawl
      this.visited.clear();
      this.queue = [url];
      this.results = [];
      this.isCrawling = true;
      this.maxPages = options?.maxPages || 10;
      
      try {
        const urlObj = new URL(url);
        this.baseUrl = urlObj.origin;
        this.baseDomain = urlObj.hostname;
      } catch (e) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid website URL",
          variant: "destructive"
        });
        this.isCrawling = false;
        return null;
      }
      
      // Start crawling
      await this.crawl();
      
      // Return the first page results
      toast({
        title: "Crawl Complete",
        description: `Successfully crawled ${this.results.length} pages into project "${projectName}"`,
      });
      
      // Update the project page count
      this.updateProjectPageCount(this.currentProjectId, this.results.length);
      
      this.isCrawling = false;
      return this.results.length > 0 ? this.results[0] : null;
    } catch (error) {
      console.error('Error during website crawl:', error);
      toast({
        title: "Crawling Error",
        description: "Failed to crawl website content. Please check the URL and try again.",
        variant: "destructive"
      });
      this.isCrawling = false;
      return null;
    }
  }
  
  private static getProjectNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return "Untitled Project";
    }
  }
  
  private static updateProjectPageCount(projectId: string, count: number): void {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      this.projects[projectIndex].pageCount = count;
    }
  }
  
  static async crawl(): Promise<void> {
    while (this.queue.length > 0 && this.visited.size < this.maxPages) {
      const currentUrl = this.queue.shift()!;
      
      if (this.visited.has(currentUrl)) {
        continue;
      }
      
      this.visited.add(currentUrl);
      
      // Scrape the current page
      const scrapedContent = await this.scrapeSinglePage(currentUrl);
      
      if (scrapedContent) {
        // Add project ID to the scraped content
        scrapedContent.projectId = this.currentProjectId;
        this.results.push(scrapedContent);
        
        // Process links to add to queue
        for (const link of scrapedContent.links) {
          let linkUrl = link.url;
          
          // Handle relative URLs
          if (linkUrl.startsWith('/')) {
            linkUrl = this.baseUrl + linkUrl;
          } else if (!linkUrl.startsWith('http')) {
            // Skip non-http links (like mailto:, tel:, etc.)
            continue;
          }
          
          try {
            const linkUrlObj = new URL(linkUrl);
            
            // Only follow links with the same domain
            if (linkUrlObj.hostname === this.baseDomain && !this.visited.has(linkUrl) && !this.queue.includes(linkUrl)) {
              this.queue.push(linkUrl);
            }
          } catch (e) {
            // Invalid URL, skip
            continue;
          }
        }
        
        // Notify progress
        if (this.results.length % 3 === 0 || this.results.length === 1) {
          toast({
            title: "Crawling in Progress",
            description: `Crawled ${this.visited.size} pages, found ${this.queue.length} more links`,
          });
        }
      }
    }
  }
  
  static async scrapeSinglePage(url: string): Promise<ScrapedContent | null> {
    try {
      // Using a proxy service to bypass CORS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch website content');
      }
      
      const html = await response.text();
      
      // Create a DOM parser to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract content
      const title = doc.title || '';
      
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => ({
        text: el.textContent?.trim() || '',
        tag: el.tagName.toLowerCase()
      })).filter(h => h.text.length > 0);
      
      const paragraphs = Array.from(doc.querySelectorAll('p')).map(el => 
        el.textContent?.trim() || ''
      ).filter(p => p.length > 0);
      
      const links = Array.from(doc.querySelectorAll('a[href]')).map(el => ({
        text: el.textContent?.trim() || '',
        url: el.getAttribute('href') || ''
      })).filter(l => l.text.length > 0);
      
      const listItems = Array.from(doc.querySelectorAll('li')).map(el => 
        el.textContent?.trim() || ''
      ).filter(l => l.length > 0);

      // Extract meta description and keywords
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
      const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || null;
      
      return {
        url,
        title,
        headings,
        paragraphs,
        links,
        listItems,
        metaDescription,
        metaKeywords
      };
      
    } catch (error) {
      console.error('Error scraping page:', error);
      return null;
    }
  }
  
  static getAllResults(): ScrapedContent[] {
    return this.results;
  }
  
  static getResultsByProject(projectId: string): ScrapedContent[] {
    return this.results.filter(result => result.projectId === projectId);
  }
  
  static getCurrentProject(): CrawlProject | null {
    return this.projects.find(p => p.id === this.currentProjectId) || null;
  }
  
  static getAllProjects(): CrawlProject[] {
    return [...this.projects];
  }
  
  static isCurrentlyCrawling(): boolean {
    return this.isCrawling;
  }
  
  static stopCrawling(): void {
    this.queue = [];
    this.isCrawling = false;
    toast({
      title: "Crawl Stopped",
      description: `Crawl stopped after processing ${this.visited.size} pages`,
    });
  }
}
