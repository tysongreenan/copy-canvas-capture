
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import type { ScrapedContent } from "@/services/ScraperService";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload, Globe, Link, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const [scrapedPages, setScrapedPages] = useState<ScrapedContent[]>([]);
  const [recentlyCrawledPages, setRecentlyCrawledPages] = useState<ScrapedContent[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'sitemap'>('grid');
  const { user } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
    setScrapedPages(prev => {
      // Check if we already have this URL to avoid duplicates
      const exists = prev.some(page => page.url === data.url);
      if (!exists) {
        return [data, ...prev];
      }
      return prev;
    });
  };
  
  const handleCrawlComplete = (allResults: ScrapedContent[]) => {
    setRecentlyCrawledPages(allResults);
    // Update the scrapedPages with all new results
    setScrapedPages(prev => {
      const newPages = [...prev];
      
      // Add all results that don't already exist
      allResults.forEach(result => {
        if (!newPages.some(page => page.url === result.url)) {
          newPages.unshift(result);
        }
      });
      
      return newPages;
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

  // Organize pages by domain and path for sitemap view
  const organizePagesBySitemap = (pages: ScrapedContent[]) => {
    const siteMap: Record<string, ScrapedContent[]> = {};
    
    pages.forEach(page => {
      const domain = getDomainFromUrl(page.url);
      if (!siteMap[domain]) {
        siteMap[domain] = [];
      }
      siteMap[domain].push(page);
    });
    
    // Sort pages within each domain by path length (approximation of hierarchy)
    Object.keys(siteMap).forEach(domain => {
      siteMap[domain].sort((a, b) => {
        const pathA = getPathFromUrl(a.url);
        const pathB = getPathFromUrl(b.url);
        return pathA.split('/').length - pathB.split('/').length;
      });
    });
    
    return siteMap;
  };

  const siteMap = organizePagesBySitemap(recentlyCrawledPages.length > 0 ? recentlyCrawledPages : scrapedPages);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Search Section */}
        <section className="py-6 border-b border-gray-200">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Illuminate Hidden Content
              </h1>
              <p className="text-gray-600">
                Extract clean, formatted content from any website instantly
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <ScrapeForm 
                onResult={handleResult} 
                onCrawlComplete={handleCrawlComplete}
              />
            </div>
          </div>
        </section>
        
        {/* Dashboard Content */}
        <section className="py-8">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Scraped Pages</h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">{scrapedPages.length} pages</div>
                {(scrapedPages.length > 0 || recentlyCrawledPages.length > 0) && (
                  <div className="flex rounded-md overflow-hidden border">
                    <Button 
                      variant={viewMode === 'grid' ? "default" : "ghost"} 
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setViewMode('grid')}
                    >
                      <Search className="h-4 w-4 mr-1" /> Grid
                    </Button>
                    <Button 
                      variant={viewMode === 'sitemap' ? "default" : "ghost"} 
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setViewMode('sitemap')}
                    >
                      <MapPin className="h-4 w-4 mr-1" /> Sitemap
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recently crawled pages section */}
            {recentlyCrawledPages.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-medium">Recently Crawled</h3>
                  <Badge variant="outline" className="bg-indigo-50">
                    {recentlyCrawledPages.length} pages
                  </Badge>
                </div>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {recentlyCrawledPages.map((page, index) => (
                      <Card 
                        key={`crawl-${index}`} 
                        className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => setScrapedData(page)}
                      >
                        <div className="w-full h-24 bg-indigo-50 flex items-center justify-center overflow-hidden p-2">
                          <div className="text-center px-4 truncate font-medium">
                            {page.title || getPathFromUrl(page.url)}
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center text-sm font-medium truncate mb-1" title={page.url}>
                            <Globe className="h-3 w-3 mr-1 text-indigo-600" />
                            {getDomainFromUrl(page.url)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 truncate" title={page.url}>
                            <Link className="h-3 w-3 mr-1" />
                            {getPathFromUrl(page.url)}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>
                              {page.paragraphs.length} paragraphs
                            </span>
                            <span>
                              {page.links.length} links
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="mb-8 border rounded-md overflow-hidden">
                    <Tabs defaultValue={Object.keys(siteMap)[0] || ''} className="w-full">
                      <TabsList className="w-full justify-start overflow-x-auto">
                        {Object.keys(siteMap).map(domain => (
                          <TabsTrigger key={domain} value={domain} className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {domain}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {Object.keys(siteMap).map(domain => (
                        <TabsContent key={domain} value={domain} className="p-4">
                          <div className="space-y-2">
                            {siteMap[domain].map((page, idx) => (
                              <div 
                                key={idx} 
                                className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                onClick={() => setScrapedData(page)}
                              >
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-medium truncate">{page.title || "Untitled"}</div>
                                  <div className="text-xs text-gray-500 truncate">{page.url}</div>
                                </div>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {page.paragraphs.length} p
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>
            )}
            
            {scrapedPages.length === 0 && !scrapedData && (
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
                <p className="text-gray-500 text-lg">Enter a URL above to extract website content</p>
                <div className="mt-4 text-sm text-gray-400">
                  Try example sites like <span className="text-primary">apple.com</span> or <span className="text-primary">wikipedia.org</span>
                </div>
              </div>
            )}
            
            {scrapedData && (
              <div className="mb-8">
                <ContentDisplay data={scrapedData} />
              </div>
            )}
            
            {scrapedPages.length > 0 && !recentlyCrawledPages.length && (
              <div>
                <h3 className="text-lg font-medium mb-4">All Pages</h3>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {scrapedPages.map((page, index) => (
                      <Card 
                        key={index} 
                        className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => setScrapedData(page)}
                      >
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <div className="text-center px-4 truncate font-medium">
                            {page.title || getPathFromUrl(page.url)}
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center text-sm font-medium truncate mb-1" title={page.url}>
                            <Globe className="h-3 w-3 mr-1 text-gray-600" />
                            {getDomainFromUrl(page.url)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 truncate" title={page.url}>
                            <Link className="h-3 w-3 mr-1" />
                            {getPathFromUrl(page.url)}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Updated just now
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Tabs defaultValue={Object.keys(siteMap)[0] || ''} className="w-full">
                      <TabsList className="w-full justify-start overflow-x-auto">
                        {Object.keys(siteMap).map(domain => (
                          <TabsTrigger key={domain} value={domain} className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {domain}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {Object.keys(siteMap).map(domain => (
                        <TabsContent key={domain} value={domain} className="p-4">
                          <div className="space-y-2">
                            {siteMap[domain].map((page, idx) => (
                              <div 
                                key={idx} 
                                className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                onClick={() => setScrapedData(page)}
                              >
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-medium truncate">{page.title || "Untitled"}</div>
                                  <div className="text-xs text-gray-500 truncate">{page.url}</div>
                                </div>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {page.paragraphs.length} p
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>
            )}
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
