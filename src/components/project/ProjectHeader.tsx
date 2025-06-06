
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
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 inline-flex items-center">
            <Globe className="h-3 w-3 mr-1" />
            {getDomainFromUrl(project.url)}
          </a>
          <span className="mx-2">•</span>
          <span>{project.page_count || 0} pages</span>
        </div>
      )}
    </div>
  );
};
