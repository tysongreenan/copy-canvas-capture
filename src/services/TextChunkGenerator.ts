
import { ScrapedContent } from "./ScraperTypes";

export interface TextChunk {
  text: string;
  metadata: {
    source: string;
    title?: string;
    type: string;
  };
}

export class TextChunkGenerator {
  /**
   * Split content into smaller chunks suitable for embeddings
   */
  public static generateChunks(content: ScrapedContent): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Process title
    if (content.title) {
      chunks.push({
        text: `Page Title: ${content.title}`,
        metadata: {
          source: content.url,
          title: content.title,
          type: 'title'
        }
      });
    }
    
    // Process meta description if available
    if (content.metaDescription) {
      chunks.push({
        text: `Page Description: ${content.metaDescription}`,
        metadata: {
          source: content.url,
          title: content.title,
          type: 'meta_description'
        }
      });
    }
    
    // Process headings with their text
    this.processHeadings(content, chunks);
    
    // Process paragraphs
    this.processParagraphs(content, chunks);
    
    // Process list items
    this.processListItems(content, chunks);
    
    return chunks;
  }
  
  /**
   * Process headings into chunks
   */
  private static processHeadings(content: ScrapedContent, chunks: TextChunk[]): void {
    if (!content.headings || content.headings.length === 0) return;
    
    // Group nearby headings together
    const headingChunks: string[] = [];
    let currentChunk = "";
    
    content.headings.forEach((heading, index) => {
      const headingText = `${heading.tag.toUpperCase()}: ${heading.text}\n`;
      
      // If adding this heading would make the chunk too large, start a new chunk
      if (currentChunk.length + headingText.length > 1000) {
        headingChunks.push(currentChunk);
        currentChunk = headingText;
      } else {
        currentChunk += headingText;
      }
      
      // If last heading, add the current chunk
      if (index === content.headings.length - 1 && currentChunk) {
        headingChunks.push(currentChunk);
      }
    });
    
    // Add heading chunks
    headingChunks.forEach(chunk => {
      chunks.push({
        text: chunk,
        metadata: {
          source: content.url,
          title: content.title,
          type: 'headings'
        }
      });
    });
  }
  
  /**
   * Process paragraphs into chunks
   */
  private static processParagraphs(content: ScrapedContent, chunks: TextChunk[]): void {
    if (!content.paragraphs || content.paragraphs.length === 0) return;
    
    // Group paragraphs into chunks of approximately 1500 characters
    const chunkSize = 1500;
    let currentChunk = "";
    
    content.paragraphs.forEach((paragraph, index) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return;
      
      // If adding this paragraph would make the chunk too large, start a new chunk
      if (currentChunk.length + paragraph.length > chunkSize) {
        chunks.push({
          text: currentChunk,
          metadata: {
            source: content.url,
            title: content.title,
            type: 'paragraphs'
          }
        });
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      }
      
      // If last paragraph, add the current chunk
      if (index === content.paragraphs.length - 1 && currentChunk) {
        chunks.push({
          text: currentChunk,
          metadata: {
            source: content.url,
            title: content.title,
            type: 'paragraphs'
          }
        });
      }
    });
  }
  
  /**
   * Process list items into chunks
   */
  private static processListItems(content: ScrapedContent, chunks: TextChunk[]): void {
    if (!content.listItems || content.listItems.length === 0) return;
    
    // Group list items into chunks of approximately 1500 characters
    const chunkSize = 1500;
    let currentChunk = "";
    
    content.listItems.forEach((item, index) => {
      const listItemText = `• ${item}\n`;
      
      // If adding this item would make the chunk too large, start a new chunk
      if (currentChunk.length + listItemText.length > chunkSize) {
        chunks.push({
          text: currentChunk,
          metadata: {
            source: content.url,
            title: content.title,
            type: 'list_items'
          }
        });
        currentChunk = listItemText;
      } else {
        currentChunk += listItemText;
      }
      
      // If last item, add the current chunk
      if (index === content.listItems.length - 1 && currentChunk) {
        chunks.push({
          text: currentChunk,
          metadata: {
            source: content.url,
            title: content.title,
            type: 'list_items'
          }
        });
      }
    });
  }
}
