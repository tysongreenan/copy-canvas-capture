
import { SitemapData } from '@/services/ScraperTypes';
import { ProjectSitemapFlow } from '@/components/sitemap/ProjectSitemapFlow';
import { EmptySitemap } from '@/components/sitemap/EmptySitemap';
import { organizeSitemapData } from '@/components/sitemap/organizeSitemapData';

interface ProjectSitemapProps {
  sitemapData?: SitemapData;
}

export function ProjectSitemap({ sitemapData }: ProjectSitemapProps) {
  if (!sitemapData || !sitemapData.nodes || sitemapData.nodes.length === 0) {
    return <EmptySitemap />;
  }

  // Ensure we have a waterfall layout with homepage at the top and simplified connections
  const organizedSitemapData = organizeSitemapData(sitemapData);

  return (
    <ProjectSitemapFlow 
      nodes={organizedSitemapData.nodes} 
      edges={organizedSitemapData.edges} 
    />
  );
}
