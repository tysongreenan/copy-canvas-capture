
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContentDisplay } from "@/components/ContentDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { ScrapedContent } from "@/services/ScraperService";

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ScrapedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !id) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('scraped_content')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching project:", error);
          toast({
            title: "Error",
            description: "Failed to load project details",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          // Convert the database record to ScrapedContent format
          const scrapedContent: ScrapedContent = {
            url: data.url,
            title: data.title,
            headings: data.content.headings || [],
            paragraphs: data.content.paragraphs || [],
            links: data.content.links || [],
            listItems: data.content.listItems || [],
            metaDescription: data.content.metaDescription || "",
            metaKeywords: data.content.metaKeywords || ""
          };
          setProject(scrapedContent);
        }
      } catch (error: any) {
        console.error("Error fetching project:", error);
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
              {project.url}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : project ? (
          <ContentDisplay data={project} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Project not found or you don't have access to it.</p>
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
