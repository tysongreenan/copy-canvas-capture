
import { toast } from "@/hooks/use-toast";

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
}

export class ScraperService {
  static async scrapeWebsite(url: string): Promise<ScrapedContent | null> {
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
      console.error('Error scraping website:', error);
      toast({
        title: "Scraping Error",
        description: "Failed to scrape website content. Please check the URL and try again.",
        variant: "destructive"
      });
      return null;
    }
  }
}
