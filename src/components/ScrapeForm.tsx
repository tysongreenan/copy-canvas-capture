
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScraperService } from "@/services/ScraperService";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { toast } from "@/hooks/use-toast";
import { Search, Upload, Globe, ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProjectService } from "@/services/ProjectService";

interface ScrapeFormProps {
  onResult: (data: ScrapedContent) => void;
  onCrawlComplete?: (data: ScrapedContent[], projectId?: string, projectName?: string) => void;
}

export function ScrapeForm({ onResult, onCrawlComplete }: ScrapeFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [crawlEntireSite, setCrawlEntireSite] = useState(false);
  const [maxPages, setMaxPages] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to extract content",
        variant: "destructive"
      });
      return;
    }
    
    // Add http:// if no protocol specified
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }
    
    setLoading(true);
    
    try {
      const options = {
        crawlEntireSite,
        maxPages: maxPages,
        projectName: ProjectService.getProjectNameFromUrl(processedUrl),
        generateEmbeddings: false
      };
      
      const result = await ScraperService.scrapeWebsite(processedUrl, options);
      
      if (result) {
        onResult(result);
        
        // If crawling entire site, notify about all results
        if (crawlEntireSite) {
          const allResults = ScraperService.getAllResults();
          
          if (onCrawlComplete) {
            onCrawlComplete(
              allResults,
              undefined,
              ProjectService.getProjectNameFromUrl(processedUrl)
            );
          }
          
          toast({
            title: "Extraction Complete",
            description: `${allResults.length} pages extracted successfully.`,
          });
        } else {
          toast({
            title: "Success",
            description: "Website content extracted successfully.",
          });
        }
      }
    } catch (error: any) {
      console.error("Error scraping:", error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract website content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter website URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-md text-lg shadow-sm border border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="crawl-toggle"
              checked={crawlEntireSite}
              onCheckedChange={setCrawlEntireSite}
            />
            <Label htmlFor="crawl-toggle" className="flex items-center cursor-pointer">
              <Globe className="mr-2 h-4 w-4 text-gray-600" />
              Extract entire website (follows links automatically)
            </Label>
          </div>
          
          {crawlEntireSite && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="max-pages" className="text-gray-700">Max pages:</Label>
              <Input
                id="max-pages"
                type="number"
                min="1"
                max="50"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-20 h-8 text-sm"
              />
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 font-medium text-lg transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {crawlEntireSite ? "Extracting Website..." : "Extracting Content..."}
              </>
            ) : (
              <>
                Extract Content Now
                <ArrowRight className="ml-1 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
