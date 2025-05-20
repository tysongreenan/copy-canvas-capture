
import { useProject } from "@/context/ProjectContext";
import { ProjectContentView } from "@/components/project/ProjectContentView";
import { ProjectSitemap } from "@/components/project/ProjectSitemap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectImport } from "@/components/project/ProjectImport";
import { Link } from "react-router-dom";
import { MessageSquare, Brush } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectTabs() {
  const { activeTab, setActiveTab, project } = useProject();
  
  // Make sure we have project before accessing its ID
  const projectId = project?.id || '';

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Link to={`/branding/${projectId}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Brush className="h-4 w-4" />
                Branding Details
              </Button>
            </Link>
            
            <Link to={`/chat/${projectId}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat with content
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="content" className="mt-4">
          <ProjectContentView />
        </TabsContent>
        
        <TabsContent value="sitemap" className="mt-4">
          <ProjectSitemap sitemapData={project?.sitemapData} />
        </TabsContent>
        
        <TabsContent value="import" className="mt-4">
          <ProjectImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
