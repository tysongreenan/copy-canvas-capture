
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { ContentService } from "@/services/ContentService";

export type ProjectContextType = {
  project: any | null;
  projectPages: ScrapedContent[];
  selectedPage: ScrapedContent | null;
  setSelectedPage: (page: ScrapedContent) => void;
  loading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
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

  return (
    <ProjectContext.Provider
      value={{
        project,
        projectPages,
        selectedPage,
        setSelectedPage,
        loading,
        error,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
