
import { Link } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedProject } from "@/services/ContentService";

interface ProjectHeaderProps {
  project: SavedProject | null;
  loading: boolean;
  getDomainFromUrl: (url: string) => string;
}

export const ProjectHeader = ({ project, loading, getDomainFromUrl }: ProjectHeaderProps) => {
  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-2"
      >
        <Link to="/dashboard">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Dashboard
        </Link>
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {loading ? "Loading project..." : project?.title || "Project Details"}
          </h1>
          
          {project?.url && (
            <div className="text-xs text-gray-500 mt-0.5">
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 inline-flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                {getDomainFromUrl(project.url)}
              </a>
              <span className="mx-2">•</span>
              <span>{project.page_count || 0} pages</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
