
/**
 * Browser-friendly implementation for web scraping
 * This uses a lightweight approach without requiring Node.js modules
 */

import { ScrapedContent } from './ScraperTypes';
import { ProxyService } from './ProxyService';

export class BrowserScraper {
  /**
   * Scrape content from a URL
   */
  static async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      const html = await ProxyService.fetchUrl(url);
      return this.extractContentFromHTML(html, url);
    } catch (error: any) {
      console.error(`Error scraping ${url}: ${error.message}`);
      return {
        url,
        title: 'Error',
        headings: [],
        paragraphs: [],
        links: [],
        listItems: [],
        metaDescription: null,
        metaKeywords: null
      };
    }
  }

  /**
   * Extract content from HTML string using browser's native DOM parsing
   */
  static extractContentFromHTML(html: string, url: string): ScrapedContent {
    // Create a DOM parser to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract data
    const title = doc.title;
    const headings: { text: string; tag: string }[] = [];
    const paragraphs: string[] = [];
    const links: { text: string; url: string }[] = [];
    const listItems: string[] = [];
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || null;
    
    // Collect headings
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach(heading => {
      headings.push({
        text: heading.textContent?.trim() || '',
        tag: heading.tagName.toLowerCase()
      });
    });
    
    // Collect paragraphs
    const paragraphElements = doc.querySelectorAll('p');
    paragraphElements.forEach(paragraph => {
      paragraphs.push(paragraph.textContent?.trim() || '');
    });
    
    // Collect links
    const linkElements = doc.querySelectorAll('a[href]');
    linkElements.forEach(link => {
      const href = link.getAttribute('href') || '';
      let absoluteUrl = href;
      try {
        absoluteUrl = new URL(href, url).href; // Resolve relative URLs
      } catch (e) {
        console.error("Failed to resolve URL:", href);
      }
      links.push({
        text: link.textContent?.trim() || '',
        url: absoluteUrl
      });
    });
    
    // Collect list items
    const listItemElements = doc.querySelectorAll('li');
    listItemElements.forEach(item => {
      listItems.push(item.textContent?.trim() || '');
    });
    
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
  }
}
