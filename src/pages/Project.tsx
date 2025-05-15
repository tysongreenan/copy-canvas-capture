
import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContentDisplay } from "@/components/ContentDisplay";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Globe, Link as LinkIcon } from "lucide-react";
import type { ScrapedContent } from "@/services/ScraperService";
import { Database } from "@/integrations/supabase/types";
import { ContentService } from "@/services/ContentService";

type ScrapedContentRecord = Database['public']['Tables']['scraped_content']['Row'];

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [projectPages, setProjectPages] = useState<ScrapedContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<ScrapedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  
  // Get domain from URL
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  // Get path from URL for better display
  const getPathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || '/';
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mb-4"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <h1 className="text-2xl font-bold">
            {loading ? "Loading project..." : project?.title || "Project Details"}
          </h1>
          
          {project?.url && (
            <div className="text-sm text-gray-500 mt-1">
              {project.url} • {project.page_count || 0} pages
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-500">{error}</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="font-medium text-lg mb-2">
                Pages ({projectPages.length})
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {projectPages.map((page, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedPage(page)}
                    className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${selectedPage?.url === page.url ? 'bg-indigo-50 border-indigo-200' : ''}`}
                  >
                    <div className="font-medium truncate">{page.title || getPathFromUrl(page.url)}</div>
                    <div className="flex items-center text-xs text-gray-500 truncate">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      {getPathFromUrl(page.url)}
                    </div>
                  </div>
                ))}
                
                {projectPages.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No pages found in this project
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-3">
              {selectedPage ? (
                <div className="border rounded-md p-4">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{selectedPage.title}</h2>
                    <div className="text-sm text-gray-500">
                      <a href={selectedPage.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600">
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedPage.url}
                      </a>
                    </div>
                  </div>
                  
                  <ContentDisplay data={selectedPage} />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Select a page from the left to view its content</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default Project;
