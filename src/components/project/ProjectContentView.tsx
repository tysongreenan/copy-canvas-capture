
import { useProject } from "@/context/ProjectContext";
import { ContentArea } from "@/components/project/ContentArea";
import { PageList } from "@/components/project/PageList";
import { getDomainFromUrl, getPathFromUrl, isMainUrl } from "@/components/project/urlUtils";

export function ProjectContentView() {
  const { 
    project,
    projectPages,
    selectedPage, 
    setSelectedPage 
  } = useProject();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <PageList 
        projectUrl={project?.url}
        projectId={project?.id}
        pages={projectPages}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        getDomainFromUrl={getDomainFromUrl}
        getPathFromUrl={getPathFromUrl}
        isMainUrl={isMainUrl}
      />
      
      <ContentArea selectedPage={selectedPage} />
    </div>
  );
}
