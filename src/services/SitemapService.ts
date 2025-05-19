import { SitemapData, SitemapEdge, SitemapNode, ScrapedContent } from './ScraperTypes';

export class SitemapService {
  /**
   * Generate sitemap data for a single page
   */
  public static generateSitemapForSinglePage(page: ScrapedContent): SitemapData {
    // Create a basic sitemap with just the main page
    const nodes: SitemapNode[] = [
      {
        id: 'home',
        type: 'siteNode',
        position: { x: 250, y: 0 }, // Position at the top
        data: {
          label: page.title || 'Home Page',
          path: '/',
          handles: ['top', 'bottom', 'left', 'right'],
          url: page.url
        }
      }
    ];
    
    // No edges for a single page
    const edges: SitemapEdge[] = [];
    
    return { nodes, edges };
  }

  /**
   * Generate sitemap data based on crawled pages
   */
  public static generateSitemapForProject(
    results: ScrapedContent[],
    startUrl: string,
    baseUrl: string,
    baseDomain: string
  ): SitemapData {
    const nodes: SitemapNode[] = [];
    const edges: SitemapEdge[] = [];
    const nodeMap: Map<string, string> = new Map(); // URL to node ID mapping
    
    if (results.length === 0) {
      return { nodes, edges };
    }
    
    // Find the home/starting page from results (match with the initial startUrl)
    const homePageIndex = results.findIndex(page => page.url === startUrl);
    const homePage = homePageIndex !== -1 ? results[homePageIndex] : results[0];
    
    // First, create a node for the home/starting page
    const homeNodeId = 'home';
    nodeMap.set(homePage.url, homeNodeId);
    
    nodes.push({
      id: homeNodeId,
      type: 'siteNode',
      position: { x: 250, y: 0 },
      data: {
        label: homePage.title || 'Home Page',
        path: '/',
        handles: ['bottom'],
        url: homePage.url
      }
    });
    
    // Helper to get node ID for a URL
    const getNodeId = (url: string): string => {
      if (nodeMap.has(url)) {
        return nodeMap.get(url)!;
      }
      
      const id = `page-${nodeMap.size}`;
      nodeMap.set(url, id);
      return id;
    };
    
    // Helper to simplify URL for display
    const getPathFromUrl = (url: string): string => {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname || '/';
      } catch (e) {
        return url;
      }
    };
    
    // Process each page to create nodes
    let rowIndex = 1;
    const maxNodesPerRow = 5;
    let processedUrls = new Set([homePage.url]);
    
    // Add nodes for other pages (after the home page)
    for (let i = 0; i < results.length; i++) {
      // Skip the home page as we've already added it
      const page = results[i];
      if (page.url === homePage.url) continue;
      
      // Skip if already processed
      if (processedUrls.has(page.url)) continue;
      processedUrls.add(page.url);
      
      const nodeId = getNodeId(page.url);
      const colPosition = (i - 1) % maxNodesPerRow;
      const rowPosition = Math.floor((i - 1) / maxNodesPerRow) + 1;
      
      nodes.push({
        id: nodeId,
        type: 'siteNode',
        position: { x: 100 + colPosition * 200, y: rowPosition * 150 },
        data: {
          label: page.title || getPathFromUrl(page.url),
          path: getPathFromUrl(page.url),
          handles: ['top', 'bottom', 'left', 'right'],
          url: page.url
        }
      });
    }
    
    // Create edges based on page links
    for (const page of results) {
      const sourceId = nodeMap.get(page.url);
      if (!sourceId) continue;
      
      // Process each link in the page
      for (const link of page.links) {
        let linkUrl = link.url;
        
        // Handle relative URLs
        if (linkUrl.startsWith('/')) {
          linkUrl = baseUrl + linkUrl;
        } else if (!linkUrl.startsWith('http')) {
          continue; // Skip non-HTTP links
        }
        
        try {
          const linkUrlObj = new URL(linkUrl);
          // Only include links to the same domain
          if (linkUrlObj.hostname === baseDomain && nodeMap.has(linkUrl)) {
            const targetId = nodeMap.get(linkUrl);
            
            // Avoid duplicate edges
            const edgeId = `${sourceId}-${targetId}`;
            if (!edges.some(e => e.id === edgeId)) {
              edges.push({
                id: edgeId,
                source: sourceId,
                target: targetId!,
                animated: true,
                style: { stroke: '#3b82f6' }
              });
            }
          }
        } catch (e) {
          // Invalid URL, skip
          continue;
        }
      }
    }
    
    return { nodes, edges };
  }

  /**
   * Simplify edges to reduce visual clutter
   */
  public static simplifyEdges(edges: SitemapEdge[]): SitemapEdge[] {
    // Group edges by source
    const edgesBySource = new Map<string, SitemapEdge[]>();
    
    edges.forEach(edge => {
      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source)?.push(edge);
    });
    
    // Keep only a limited number of edges per source
    const simplifiedEdges: SitemapEdge[] = [];
    
    edgesBySource.forEach((sourceEdges, source) => {
      // Limit to 3 outgoing edges per node
      const limitedEdges = sourceEdges.slice(0, 3);
      simplifiedEdges.push(...limitedEdges);
    });
    
    return simplifiedEdges;
  }
}
