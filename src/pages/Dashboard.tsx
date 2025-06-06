import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import type { ScrapedContent, CrawlProject } from "@/services/ScraperTypes";
import { ScraperService } from "@/services/ScraperService";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload, Globe, Link as LinkIcon, Calendar, ChevronRight, Map, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentService, SavedProject } from "@/services/ContentService";
import { SaveButton } from "@/components/SaveButton";
import { SaveProjectButton } from "@/components/SaveProjectButton";
import { toast } from "@/hooks/use-toast";
import { ProjectSitemap } from "@/components/project/ProjectSitemap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const [currentProject, setCurrentProject] = useState<CrawlProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("create");
  const { user, currentTeamId } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch saved projects when component mounts
  useEffect(() => {
    if (!user) return;
    
    const fetchSavedProjects = async () => {
      setLoadingSaved(true);
      try {
        const projects = await ContentService.getUserProjects(currentTeamId);
        setSavedProjects(projects);
      } catch (error) {
        console.error("Error fetching saved projects:", error);
      } finally {
        setLoadingSaved(false);
      }
    };
    
    fetchSavedProjects();
  }, [user, currentTeamId]);

  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
  };
  
  const handleCrawlComplete = (pages: ScrapedContent[], projectId?: string, projectName?: string) => {
    if (pages.length > 0) {
      const project = ScraperService.getCurrentProject();
      if (project) {
        setCurrentProject(project);
        
        // Hide the single scraped page when we have a project
        setScrapedData(null);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
      
      <main className="flex-1">
        {/* Dashboard Content */}
        <section className="py-8">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex gap-2">
                <Link to="/scrapcopy">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Copy Scraper Tool
                  </Button>
                </Link>
                <Link to="/project/new">
                  <Button size="sm" className="gap-2">
                    Setup New Project
                  </Button>
                </Link>
              </div>
            </div>
            
            
            
            <Tabs defaultValue="projects" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
              
              
              <TabsList>
                <TabsTrigger value="projects">Your Projects</TabsTrigger>
                <TabsTrigger value="create">Create New Project</TabsTrigger>
              </TabsList>
              
              {/* Projects Tab */}
              <TabsContent value="projects" className="pt-4">
                {savedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {savedProjects.map((project) => (
                      <Card 
                        key={project.id}
                        className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow h-full"
                      >
                        <div className="w-full h-24 bg-green-50 flex items-center justify-center overflow-hidden p-2">
                          <div className="text-center px-4 truncate font-medium">
                            {project.title || getDomainFromUrl(project.url)}
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center text-sm font-medium truncate" title={project.url}>
                              <Globe className="h-3 w-3 mr-1 text-green-600" />
                              {getDomainFromUrl(project.url)}
                            </div>
                            
                            <Badge variant="outline" className="ml-2">
                              {project.page_count} pages
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 truncate" title={project.url}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(project.created_at)}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <Link to={`/project/${project.id}`}>
                              <Button variant="outline" size="sm">
                                View Project
                              </Button>
                            </Link>
                            <Link to={`/chat/${project.id}`}>
                              <Button variant="default" size="sm">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <line x1="10" y1="9" x2="8" y2="9"/>
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">You don't have any projects yet</p>
                    <div className="mt-4">
                      <Link to="/project/new">
                        <Button>
                          Create Your First Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Create New Project Tab */}
              <TabsContent value="create" className="pt-4">
                <div className="max-w-3xl mx-auto">
                  <Card className="border-0 shadow-md overflow-hidden">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold mb-1">Create a New Project</h2>
                          <p className="text-gray-500">
                            Get started by creating a project with our quick setup or use our advanced wizard.
                          </p>
                        </div>
                        
                        <Link to="/project/new">
                          <Button>
                            Use Project Wizard
                          </Button>
                        </Link>
                      </div>
                      
                      <p className="text-gray-500 mb-6">
                        Or use our basic setup below to quickly scrape a website:
                      </p>
                      
                      <ScrapeForm 
                        onResult={handleResult} 
                        onCrawlComplete={handleCrawlComplete} 
                      />
                    </CardContent>
                  </Card>
                </div>
                
                {/* Current crawl project */}
                {currentProject && (
                  <div className="mt-8 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold">
                          Project: {currentProject.name}
                        </h2>
                        <div className="text-sm text-gray-500">
                          {currentProject.pageCount} pages crawled
                        </div>
                      </div>
                      
                      <SaveProjectButton 
                        title={currentProject.name}
                        startUrl={currentProject.startUrl}
                        contents={ScraperService.getResultsByProject(currentProject.id)}
                      />
                    </div>
                    
                    <Tabs defaultValue="pages" className="mb-8">
                      <TabsList>
                        <TabsTrigger value="pages">Pages ({currentProject.pageCount})</TabsTrigger>
                        <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="pages" className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ScraperService.getResultsByProject(currentProject.id).slice(0, 6).map((page, index) => (
                            <Card 
                              key={`project-${index}`} 
                              className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => setScrapedData(page)}
                            >
                              <div className="w-full h-24 bg-indigo-50 flex items-center justify-center overflow-hidden p-2">
                                <div className="text-center px-4 truncate font-medium">
                                  {page.title || getPathFromUrl(page.url)}
                                </div>
                              </div>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center text-sm font-medium truncate" title={page.url}>
                                    <Globe className="h-3 w-3 mr-1 text-indigo-600" />
                                    {getDomainFromUrl(page.url)}
                                  </div>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 truncate" title={page.url}>
                                  <LinkIcon className="h-3 w-3 mr-1" />
                                  {getPathFromUrl(page.url)}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {currentProject.pageCount > 6 && (
                          <div className="text-center mt-4">
                            <Button variant="outline">View all {currentProject.pageCount} pages</Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="sitemap" className="pt-4">
                        <ProjectSitemap sitemapData={currentProject.sitemapData} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
                
                {/* Single page scrape result */}
                {scrapedData && !currentProject && (
                  <div className="mt-8 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Scraped Content</h2>
                      <SaveButton content={scrapedData} />
                    </div>
                    
                    <ContentDisplay data={scrapedData} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
