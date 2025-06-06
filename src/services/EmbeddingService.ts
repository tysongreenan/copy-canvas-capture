
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedContent {
  url: string;
  title: string;
  headings: Array<{tag: string; text: string}>;
  paragraphs: string[];
  links: Array<{url: string; text: string}>;
  listItems: string[];
  metaDescription: string;
  metaKeywords: string;
}

export const EmbeddingService = {
  async processFile(file: File, projectId: string): Promise<boolean> {
    try {
      console.log(`Processing file: ${file.name} for project ${projectId}`);
      
      // Use the existing process-file edge function
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: { 
          file: await this.fileToBase64(file),
          fileName: file.name,
          projectId: projectId
        }
      });

      if (error) {
        console.error('Error processing file:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error in processFile:', error);
      return false;
    }
  },

  async processContent(content: ScrapedContent, projectId: string): Promise<void> {
    try {
      // Extract text content from the scraped content
      let textContent = '';
      
      // Add title
      if (content.title) {
        textContent += content.title + '\n\n';
      }
      
      // Add headings
      content.headings.forEach(heading => {
        textContent += heading.text + '\n';
      });
      
      // Add paragraphs
      content.paragraphs.forEach(paragraph => {
        textContent += paragraph + '\n';
      });
      
      // Add list items
      content.listItems.forEach(item => {
        textContent += '- ' + item + '\n';
      });
      
      // Add meta description
      if (content.metaDescription) {
        textContent += content.metaDescription + '\n';
      }

      // Split into chunks and process each one
      const chunks = this.splitTextIntoChunks(textContent);
      
      for (const chunk of chunks) {
        await supabase.functions.invoke('process-embeddings', {
          body: {
            text: chunk,
            projectId: projectId,
            metadata: {
              source: content.url,
              title: content.title,
              type: 'scraped_content'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error processing content:', error);
      throw error;
    }
  },

  async processProject(projectId: string, scrapedPages: ScrapedContent[]): Promise<void> {
    try {
      console.log(`Processing ${scrapedPages.length} pages for project ${projectId}`);
      
      // Process each page directly instead of using job queue
      for (const page of scrapedPages) {
        await this.processContent(page, projectId);
      }
    } catch (error) {
      console.error('Error processing project:', error);
      throw error;
    }
  },

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove the data:type;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  },

  private splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
    if (!text || text.length <= maxChunkSize) {
      return text ? [text] : [];
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
      
      if (potentialChunk.length <= maxChunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }

    return chunks.filter(chunk => chunk.length > 20);
  }
};
