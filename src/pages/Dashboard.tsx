
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import type { ScrapedContent, CrawlProject } from "@/services/ScraperTypes";
import { ScraperService } from "@/services/ScraperService";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload, Globe, MessageSquare, ArrowRight, Copy, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentService, SavedProject } from "@/services/ContentService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSitemap } from "@/components/project/ProjectSitemap";

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const [currentProject, setCurrentProject] = useState<CrawlProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pages");
  const { user } = useAuth();
  const { toast } = useToast();

  // Get domain from URL
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  // Handle the scraping result
  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
    window.scrollTo({ top: document.getElementById('results')?.offsetTop || 0, behavior: 'smooth' });
  };
  
  // Handle crawl completion
  const handleCrawlComplete = (pages: ScrapedContent[], projectId?: string, projectName?: string) => {
    if (pages.length > 0) {
      const project = ScraperService.getCurrentProject();
      if (project) {
        setCurrentProject(project);
        setScrapedData(null);
        window.scrollTo({ top: document.getElementById('results')?.offsetTop || 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="container max-w-5xl px-6 md:px-0 mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                Extract All Website Content <span className="text-indigo-600">In Seconds</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Copy all text from any website instantly. Get headings, paragraphs, links, and more - 
                perfect for content analysis, SEO, or marketing research.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 md:p-8">
              <ScrapeForm 
                onResult={handleResult} 
                onCrawlComplete={handleCrawlComplete}
              />
            </div>
            
            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-indigo-50 p-3 rounded-full mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Entire Website Scraping</h3>
                <p className="text-gray-600">Extract content from single pages or crawl entire websites automatically.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-indigo-50 p-3 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Structured Content</h3>
                <p className="text-gray-600">Get organized content with headings, paragraphs, and links clearly separated.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-indigo-50 p-3 rounded-full mb-4">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Chat Experience</h3>
                <p className="text-gray-600">Chat with your website content using our intelligent AI assistant.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Results Section */}
        <section id="results" className="py-12">
          <div className="container max-w-6xl px-6 md:px-0 mx-auto">
            {/* Current crawl project */}
            {currentProject && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Website Content Results
                  </h2>
                  
                  {user ? (
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "Starting chat",
                          description: "Preparing your website content for chat...",
                        });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat with this content
                    </Button>
                  ) : (
                    <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                      <Link to="/auth">
                        Sign in to save & chat
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center">
                    <Globe className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="font-medium">{currentProject.name}</span>
                    <Badge variant="outline" className="ml-3 bg-indigo-50 text-indigo-700 border-indigo-200">
                      {currentProject.pageCount} pages
                    </Badge>
                  </div>
                  
                  <Tabs defaultValue="pages" className="w-full" onValueChange={setActiveTab}>
                    <div className="p-4 border-b border-gray-200">
                      <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="pages">Page Content</TabsTrigger>
                        <TabsTrigger value="sitemap">Site Structure</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="pages" className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ScraperService.getResultsByProject(currentProject.id).slice(0, 6).map((page, index) => (
                          <Card 
                            key={`project-${index}`} 
                            className="overflow-hidden border border-gray-200 hover:border-indigo-200 transition-all cursor-pointer group"
                            onClick={() => setScrapedData(page)}
                          >
                            <div className="w-full h-24 bg-gray-50 flex items-center justify-center overflow-hidden p-2 group-hover:bg-indigo-50 transition-colors">
                              <div className="text-center px-4 truncate font-medium">
                                {page.title || getDomainFromUrl(page.url)}
                              </div>
                            </div>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center text-sm truncate" title={page.url}>
                                  <Globe className="h-3 w-3 mr-1 text-gray-600" />
                                  {getDomainFromUrl(page.url)}
                                </div>
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  <Copy className="h-3 w-3 text-gray-500 hover:text-indigo-600" />
                                </Button>
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-1" title={page.url}>
                                {page.headings.length} headings, {page.paragraphs.length} paragraphs, {page.links.length} links
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {currentProject.pageCount > 6 && (
                        <div className="text-center mt-6">
                          <Button variant="outline">View all {currentProject.pageCount} pages</Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="sitemap" className="p-6">
                      <ProjectSitemap sitemapData={currentProject.sitemapData} />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 rounded-full p-2 mr-3">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Want to do more with your website content?</h3>
                      <p className="text-gray-700 mb-3">Create an account to save your content, chat with it using AI, and discover insights.</p>
                      {!user ? (
                        <Button asChild variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Link to="/auth">
                            Get started
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Link to="/chat">
                            Go to AI Chat
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Single page scrape result */}
            {scrapedData && !currentProject && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Scraped Content
                  </h2>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                      // Copy content to clipboard
                      const content = scrapedData.paragraphs.join('\n\n');
                      navigator.clipboard.writeText(content);
                      toast({
                        title: "Content copied",
                        description: "Website content has been copied to clipboard",
                      });
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All Text
                    </Button>
                    
                    {user ? (
                      <Button 
                        variant="default"
                        onClick={() => {
                          toast({
                            title: "Starting chat",
                            description: "Preparing your website content for chat...",
                          });
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat with this content
                      </Button>
                    ) : (
                      <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                        <Link to="/auth">
                          Sign in to save & chat
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                
                <ContentDisplay data={scrapedData} />
              </div>
            )}
            
            {/* Empty state */}
            {!scrapedData && !currentProject && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 text-gray-200">
                  <Search className="w-full h-full" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Extracting Website Content</h2>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                  Enter any website URL above to extract all the content instantly
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Back to top
                  </Button>
                  
                  <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      // Example URL
                      const exampleForm = document.querySelector('form') as HTMLFormElement;
                      if (exampleForm) {
                        const input = exampleForm.querySelector('input') as HTMLInputElement;
                        if (input) {
                          input.value = "https://example.com";
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }
                    }}>
                      Try an example
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* SEO Benefits Section */}
        <section className="py-12 bg-gray-50">
          <div className="container max-w-5xl px-6 md:px-0 mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Why Use Our Website Content Extractor?
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Save hours of manual copying with our powerful extraction tool. Perfect for content research, SEO analysis, and more.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">For Content Creators</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Extract and analyze competitor content</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Research topics and gather information quickly</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Save hours of manual copying and formatting</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Build content libraries for reference</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">For SEO Specialists</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Analyze heading structure and content hierarchy</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Extract metadata, keywords, and descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Map internal linking structure</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Perform competitor content analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="container max-w-5xl mx-auto px-6 md:px-0">
          <div className="text-center">
            <h3 className="font-bold text-xl mb-2">Website Content Extractor</h3>
            <p className="text-gray-500 mb-6">The fastest way to extract and analyze website content</p>
            
            <div className="flex justify-center items-center gap-6 mb-6">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">About</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Terms</a>
            </div>
            
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Lumen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
