
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ScrapedContent } from "@/services/ScraperService";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Search, TestTube, Archive } from "lucide-react";

const Index = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const [scrapedPages, setScrapedPages] = useState<ScrapedContent[]>([]);
  const { user } = useAuth();

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

  const features = [
    {
      title: "Content Extraction",
      description: "Extract headings, paragraphs, links and more from any website with a single click",
      icon: <Search className="w-10 h-10 text-primary" />
    },
    {
      title: "Clean Formatting",
      description: "Get ready-to-use content without ads, navigation or other distractions",
      icon: <TestTube className="w-10 h-10 text-primary" />
    },
    {
      title: "Instant Results",
      description: "No waiting - get your content immediately and ready for implementation",
      icon: <Archive className="w-10 h-10 text-primary" />
    }
  ];

  // Get domain from URL
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <Header />
      
      <main className="flex-1 relative z-0">
        {/* Search Section */}
        <section className="py-8 border-b border-gray-200">
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
        
        {/* Scraped Pages Section */}
        <section className="py-8">
          <div className="container max-w-5xl px-6 md:px-0">
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

        {/* Features Section - Only show if no data yet */}
        {!scrapedData && (
          <section className="py-16 md:py-20 bg-gray-50">
            <div className="container max-w-5xl px-6 md:px-0">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
                <div className="h-1 w-20 bg-primary mx-auto"></div>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  Everything you need to extract and repurpose website content efficiently.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6 px-6 pb-6 flex flex-col items-center text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-3">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
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

export default Index;
