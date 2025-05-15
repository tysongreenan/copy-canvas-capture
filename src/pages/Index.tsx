
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ScrapedContent } from "@/services/ScraperService";

const Index = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const { user } = useAuth();

  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white relative">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <Header />
      
      <main className="flex-1 container max-w-5xl py-8 px-6 md:px-0 relative z-0">
        <div className="max-w-2xl mx-auto">
          <ScrapeForm onResult={handleResult} />
        </div>
        
        {scrapedData && <ContentDisplay data={scrapedData} />}
        
        {!scrapedData && (
          <div className="mt-12 text-center">
            <div className="w-48 h-48 mx-auto mb-6 text-gray-200">
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
            
            {!user && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                <h3 className="font-medium mb-2">Want to save your results?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create an account or log in to save scraped content for future reference.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Sign up or log in</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500">
        <div className="container">
          <p>CopyScraper • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
