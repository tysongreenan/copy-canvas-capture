
// Common types used by the scraper services

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
  sitemapData?: SitemapData; // Property for sitemap data
}

export interface SitemapData {
  nodes: SitemapNode[];
  edges: SitemapEdge[];
}

export interface SitemapNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    icon?: React.ReactNode;
    path: string;
    handles: string[];
    description?: string;
    url: string;
  };
}

export interface SitemapEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: { stroke: string };
}

export interface CrawlOptions {
  crawlEntireSite: boolean;
  maxPages?: number;
  projectName?: string;
}
