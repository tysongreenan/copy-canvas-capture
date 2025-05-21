
import { ScrapedContent } from './ScraperTypes';

export interface ContentComparison {
  newContent: ScrapedContent[];
  changedContent: ScrapedContent[];
  unchangedContent: ScrapedContent[];
  removedUrls: string[];
}

export class ContentComparisonService {
  /**
   * Compare new scraped content with existing content to determine what has changed
   */
  public static compareContent(
    existingContent: ScrapedContent[], 
    newlyScrapedContent: ScrapedContent[]
  ): ContentComparison {
    const existingUrls = new Set(existingContent.map(content => content.url));
    const newUrls = new Set(newlyScrapedContent.map(content => content.url));
    
    // Find brand new pages (URLs that didn't exist before)
    const newContent = newlyScrapedContent.filter(content => !existingUrls.has(content.url));
    
    // Find pages that have been removed (URLs that existed before but not in the new scrape)
    const removedUrls = [...existingUrls].filter(url => !newUrls.has(url));
    
    // Find content that exists in both but may have changed
    const changedContent: ScrapedContent[] = [];
    const unchangedContent: ScrapedContent[] = [];
    
    // Check each new piece of content that has a matching URL in existing content
    newlyScrapedContent
      .filter(content => existingUrls.has(content.url))
      .forEach(newContent => {
        const existingItem = existingContent.find(item => item.url === newContent.url);
        
        if (existingItem) {
          // Compare content to see if it's changed
          if (this.hasContentChanged(existingItem, newContent)) {
            changedContent.push(newContent);
          } else {
            unchangedContent.push(newContent);
          }
        }
      });
    
    return {
      newContent,
      changedContent,
      unchangedContent,
      removedUrls
    };
  }
  
  /**
   * Determine if content has changed by comparing key properties
   */
  private static hasContentChanged(existing: ScrapedContent, updated: ScrapedContent): boolean {
    // Compare title
    if (existing.title !== updated.title) return true;
    
    // Compare meta description and keywords
    if (existing.metaDescription !== updated.metaDescription) return true;
    if (existing.metaKeywords !== updated.metaKeywords) return true;
    
    // Compare paragraphs (length and content)
    if (existing.paragraphs.length !== updated.paragraphs.length) return true;
    for (let i = 0; i < existing.paragraphs.length; i++) {
      if (existing.paragraphs[i] !== updated.paragraphs[i]) return true;
    }
    
    // Compare headings (length and content)
    if (existing.headings.length !== updated.headings.length) return true;
    for (let i = 0; i < existing.headings.length; i++) {
      if (existing.headings[i].text !== updated.headings[i].text ||
          existing.headings[i].tag !== updated.headings[i].tag) {
        return true;
      }
    }
    
    // Compare list items (length and content)
    if (existing.listItems.length !== updated.listItems.length) return true;
    for (let i = 0; i < existing.listItems.length; i++) {
      if (existing.listItems[i] !== updated.listItems[i]) return true;
    }
    
    // If we got here, the content is the same
    return false;
  }
}
