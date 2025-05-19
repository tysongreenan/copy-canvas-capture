
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSitemap } from "./ProjectSitemap";
import { ProjectContentView } from "./ProjectContentView";
import { useProject } from "@/context/ProjectContext";

export function ProjectTabs() {
  const { activeTab, setActiveTab } = useProject();
  
  return (
    <Tabs defaultValue={activeTab} className="mb-6" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content" className="pt-4">
        <ProjectContentView />
      </TabsContent>
      
      <TabsContent value="sitemap" className="pt-4">
        <ProjectSitemap sitemapData={generateSitemapData()} />
      </TabsContent>
    </Tabs>
  );
}

// Generate sitemap data from project pages
function generateSitemapData() {
  const { projectPages, project } = useProject();
  
  if (!projectPages || projectPages.length === 0) return undefined;

  const nodes = [];
  const edges = [];
  const nodeMap = new Map();

  // Ensure we use the project's URL as the starting point/home page
  const projectUrl = project?.url || "";
  
  // Find the homepage (matching the project URL) or use the first page
  const homePageIndex = projectPages.findIndex(page => page.url === projectUrl);
  const homePage = homePageIndex !== -1 ? projectPages[homePageIndex] : projectPages[0];
  
  // Create home node
  const homeId = 'home';
  nodeMap.set(homePage.url, homeId);

  nodes.push({
    id: homeId,
    type: 'siteNode',
    position: { x: 250, y: 0 },
    data: {
      label: homePage.title || 'Home Page',
      icon: undefined,
      path: '/',
      handles: ['bottom'],
      url: homePage.url
    }
  });

  // Add rest of the pages
  let rowIndex = 1;
  const maxNodesPerRow = 4;
  const processedUrls = new Set([homePage.url]);

  // Process remaining pages
  for (let i = 0; i < projectPages.length; i++) {
    // Skip the home page as it's already added
    const page = projectPages[i];
    if (processedUrls.has(page.url)) continue;
    processedUrls.add(page.url);

    const nodeId = `page-${i}`;
    nodeMap.set(page.url, nodeId);

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

    // Create edge from home to this page
    edges.push({
      id: `${homeId}-${nodeId}`,
      source: homeId,
      target: nodeId,
      animated: true,
      style: { stroke: '#3b82f6' }
    });
  }

  // Create edges between pages based on links
  for (const page of projectPages) {
    const sourceId = nodeMap.get(page.url);
    if (!sourceId) continue;

    for (const link of page.links || []) {
      let linkUrl = link.url;
      
      // Handle relative URLs
      if (linkUrl.startsWith('/')) {
        try {
          const pageUrl = new URL(page.url);
          linkUrl = `${pageUrl.origin}${linkUrl}`;
        } catch (e) {
          continue;
        }
      }

      const targetId = nodeMap.get(linkUrl);
      if (targetId && sourceId !== targetId) {
        // Avoid duplicate edges
        const edgeId = `${sourceId}-${targetId}`;
        if (!edges.some(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            animated: false,
            style: { stroke: '#3b82f6' }
          });
        }
      }
    }
  }

  return { nodes, edges };
}

// Helper function to get path from URL
function getPathFromUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname || '/';
  } catch (e) {
    return url;
  }
}
