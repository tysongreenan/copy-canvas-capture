
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
import { getDomainFromUrl, getPathFromUrl, isMainUrl } from "@/components/project/urlUtils";

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
        )}
      </main>
      
      <ProjectFooter />
    </div>
  );
};

export default Project;
