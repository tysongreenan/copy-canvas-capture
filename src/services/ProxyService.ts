
/**
 * Proxy service to handle CORS issues when scraping websites
 */
import axios from 'axios';

export class ProxyService {
  // Use a CORS proxy to access websites that don't allow direct access
  private static corsProxyUrl = 'https://api.allorigins.win/raw?url=';
  
  /**
   * Fetch content from a URL using a CORS proxy if needed
   */
  public static async fetchUrl(url: string): Promise<string> {
    try {
      // Try direct access first
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      // If direct access fails, try using the CORS proxy
      console.log(`Direct access failed, trying CORS proxy for ${url}`);
      try {
        const proxyUrl = this.corsProxyUrl + encodeURIComponent(url);
        const proxyResponse = await axios.get(proxyUrl);
        return proxyResponse.data;
      } catch (proxyError: any) {
        throw new Error(`Failed to fetch URL via proxy: ${proxyError.message}`);
      }
    }
  }
}
