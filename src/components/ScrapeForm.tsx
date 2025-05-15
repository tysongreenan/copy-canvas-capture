
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScraperService } from "@/services/ScraperService";
import type { ScrapedContent } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";
import { Search, Upload, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ScrapeFormProps {
  onResult: (data: ScrapedContent) => void;
  onCrawlComplete?: (data: ScrapedContent[], projectId?: string, projectName?: string) => void;
}

export function ScrapeForm({ onResult, onCrawlComplete }: ScrapeFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [crawlEntireSite, setCrawlEntireSite] = useState(false);
  const [maxPages, setMaxPages] = useState(10);
  const [projectName, setProjectName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to illuminate",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const options = {
        crawlEntireSite,
        maxPages: maxPages,
        projectName: projectName || getDomainFromUrl(url)
      };
      
      const result = await ScraperService.scrapeWebsite(url, options);
      
      if (result) {
        onResult(result);
        
        // If crawling entire site, notify about all results
        if (crawlEntireSite) {
          const allResults = ScraperService.getAllResults();
          
          if (onCrawlComplete) {
            onCrawlComplete(
              allResults,
              // We'll use a URL-based project name if none is provided
              undefined,
              projectName || getDomainFromUrl(url)
            );
          }
        } else {
          toast({
            title: "Success",
            description: "Website content illuminated successfully",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Get domain from URL for default project name
  const getDomainFromUrl = (url: string) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      return new URL(fullUrl).hostname;
    } catch (e) {
      return url;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter website URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="crawl-toggle"
            checked={crawlEntireSite}
            onCheckedChange={setCrawlEntireSite}
          />
          <Label htmlFor="crawl-toggle" className="flex items-center cursor-pointer">
            <Globe className="mr-2 h-4 w-4" />
            Crawl entire website (follows links on the same domain)
          </Label>
        </div>
        
        {crawlEntireSite && (
          <>
            <div className="flex items-center space-x-2">
              <Label htmlFor="max-pages" className="min-w-[120px]">Maximum pages:</Label>
              <Input
                id="max-pages"
                type="number"
                min="1"
                max="100"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-500">
                (Higher values may take longer)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="project-name" className="min-w-[120px]">Project name:</Label>
              <Input
                id="project-name"
                type="text"
                placeholder={getDomainFromUrl(url) || "My Project"}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1"
              />
            </div>
          </>
        )}
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="px-6 font-medium transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? (crawlEntireSite ? "Crawling..." : "Illuminating...") : "Go"}
          </Button>
          <Button 
            type="button" 
            disabled={loading}
            variant="outline"
            className="px-6 font-medium transition-all duration-200 border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          {loading && crawlEntireSite && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => { /* Add stop crawl function */ }}
              className="px-6 font-medium"
            >
              Stop Crawl
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
