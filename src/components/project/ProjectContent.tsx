
import { useProject } from "@/context/ProjectContext";
import { LoadingState } from "@/components/project/LoadingState";
import { ErrorState } from "@/components/project/ErrorState";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { getDomainFromUrl } from "@/components/project/urlUtils";

export function ProjectContent() {
  const { project, loading, error } = useProject();
  
  return (
    <>
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
        <ProjectTabs />
      )}
    </>
  );
}
