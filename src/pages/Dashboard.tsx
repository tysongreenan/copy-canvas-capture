
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import type { ScrapedContent } from "@/services/ScraperService";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload } from "lucide-react";

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const [scrapedPages, setScrapedPages] = useState<ScrapedContent[]>([]);
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

  // Get domain from URL
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

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
              <ScrapeForm onResult={handleResult} />
            </div>
          </div>
        </section>
        
        {/* Dashboard Content */}
        <section className="py-8">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Scraped Pages</h2>
              <div className="text-sm text-gray-500">{scrapedPages.length} pages</div>
            </div>
            
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
            
            {scrapedPages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {scrapedPages.map((page, index) => (
                  <Card key={index} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => setScrapedData(page)}>
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <div className="text-center px-4 truncate font-medium">
                        {page.title || getDomainFromUrl(page.url)}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate" title={page.url}>
                        {getDomainFromUrl(page.url)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Updated just now
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
