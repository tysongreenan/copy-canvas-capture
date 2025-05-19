import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { ScrapedContent } from "@/services/ScraperService";
import { ContentService } from "@/services/ContentService";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { PageList } from "@/components/project/PageList";
import { ContentArea } from "@/components/project/ContentArea";
import { ProjectFooter } from "@/components/project/ProjectFooter";
import { LoadingState } from "@/components/project/LoadingState";
import { ErrorState } from "@/components/project/ErrorState";
import { ProjectSitemap } from "@/components/project/ProjectSitemap";
import { getDomainFromUrl, getPathFromUrl, isMainUrl } from "@/components/project/urlUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [projectPages, setProjectPages] = useState<ScrapedContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<ScrapedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("content");
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !id) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        // First get the project information
        const project = await ContentService.getProjectById(id);
        
        if (!project) {
          setError("Project not found");
          setLoading(false);
          return;
        }
        
        setProject(project);
        
        // Then get all pages for this project
        const pages = await ContentService.getProjectPages(id);
        
        if (pages && pages.length > 0) {
          const scrapedPages = pages.map(page => {
            // Safely type the content object
            const contentObj = page.content as {
              headings: Array<{tag: string; text: string}>;
              paragraphs: string[];
              links: Array<{url: string; text: string}>;
              listItems: string[];
              metaDescription: string;
              metaKeywords: string;
            };
            
            // Convert the database record to ScrapedContent format
            return {
              url: page.url,
              title: page.title || "",
              headings: contentObj.headings || [],
              paragraphs: contentObj.paragraphs || [],
              links: contentObj.links || [],
              listItems: contentObj.listItems || [],
              metaDescription: contentObj.metaDescription || "",
              metaKeywords: contentObj.metaKeywords || ""
            };
          });
          
          setProjectPages(scrapedPages);
          setSelectedPage(scrapedPages[0]);
        }
      } catch (error: any) {
        console.error("Error fetching project:", error);
        setError(error.message || "Failed to load project");
        toast({
          title: "Error",
          description: error.message || "Failed to load project",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Generate sitemap data from project pages
  const generateSitemapData = () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6">
        <ProjectHeader 
          project={project} 
          loading={loading} 
          getDomainFromUrl={getDomainFromUrl} 
        />
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <>
            <Tabs defaultValue="content" className="mb-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <PageList 
                    projectUrl={project?.url}
                    pages={projectPages}
                    selectedPage={selectedPage}
                    setSelectedPage={setSelectedPage}
                    getDomainFromUrl={getDomainFromUrl}
                    getPathFromUrl={getPathFromUrl}
                    isMainUrl={isMainUrl}
                  />
                  
                  <ContentArea selectedPage={selectedPage} />
                </div>
              </TabsContent>
              
              <TabsContent value="sitemap" className="pt-4">
                <ProjectSitemap sitemapData={generateSitemapData()} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      
      <ProjectFooter />
    </div>
  );
};

export default Project;
