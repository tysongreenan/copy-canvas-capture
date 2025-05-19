// Make sure ScraperService imports types from ScraperTypes
import { ScrapedContent, CrawlProject, SitemapData, CrawlOptions } from './ScraperTypes';

import { JSDOM } from 'jsdom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ProjectService } from './ProjectService';
import { SitemapService } from './SitemapService';

export class ScraperService {
  private static results: ScrapedContent[] = [];
  private static currentProject: CrawlProject | null = null;
  private static baseUrl: string = '';
  private static baseDomain: string = '';
  
  /**
   * Scrape content from a single page
   */
  public static async scrapeContent(url: string): Promise<ScrapedContent> {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Extract data
      const title = document.title;
      const headings: { text: string; tag: string }[] = [];
      const paragraphs: string[] = [];
      const links: { text: string; url: string }[] = [];
      const listItems: string[] = [];
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
      
      // Collect headings
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingElements.forEach(heading => {
        headings.push({
          text: heading.textContent?.trim() || '',
          tag: heading.tagName.toLowerCase()
        });
      });
      
      // Collect paragraphs
      const paragraphElements = document.querySelectorAll('p');
      paragraphElements.forEach(paragraph => {
        paragraphs.push(paragraph.textContent?.trim() || '');
      });
      
      // Collect links
      const linkElements = document.querySelectorAll('a[href]');
      linkElements.forEach(link => {
        const href = link.getAttribute('href') || '';
        const absoluteUrl = new URL(href, url).href; // Resolve relative URLs
        links.push({
          text: link.textContent?.trim() || '',
          url: absoluteUrl
        });
      });
      
      // Collect list items
      const listItemElements = document.querySelectorAll('li');
      listItemElements.forEach(item => {
        listItems.push(item.textContent?.trim() || '');
      });
      
      const scrapedContent: ScrapedContent = {
        url: url,
        title: title,
        headings: headings,
        paragraphs: paragraphs,
        links: links,
        listItems: listItems,
        metaDescription: metaDescription,
        metaKeywords: metaKeywords,
      };
      
      return scrapedContent;
    } catch (error: any) {
      console.error(`Error scraping ${url}: ${error.message}`);
      
      // Return a default object in case of an error
      return {
        url: url,
        title: 'Error',
        headings: [],
        paragraphs: [],
        links: [],
        listItems: [],
        metaDescription: null,
        metaKeywords: null,
      };
    }
  }
  
  /**
   * Crawl an entire site
   */
  public static async crawlSite(startUrl: string, options: CrawlOptions): Promise<ScrapedContent[]> {
    this.results = []; // Reset results for a new crawl
    
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
    
    while (queue.length > 0 && (options.crawlEntireSite || (options.maxPages && pageCount < options.maxPages))) {
      const url = queue.shift()!;
      
      if (visited.has(url)) continue;
      visited.add(url);
      
      console.log(`Crawling ${url}`);
      const content = await this.scrapeContent(url);
      content.projectId = projectId; // Assign the project ID to the content
      this.results.push(content);
      pageCount++;
      
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
