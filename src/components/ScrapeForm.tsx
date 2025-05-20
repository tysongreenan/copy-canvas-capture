
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScraperService } from "@/services/ScraperService";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { toast } from "@/hooks/use-toast";
import { Search, Upload, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProjectService } from "@/services/ProjectService";

interface ScrapeFormProps {
  onResult: (data: ScrapedContent) => void;
  onCrawlComplete?: (data: ScrapedContent[], projectId?: string, projectName?: string) => void;
  projectId?: string;
  inProjectView?: boolean;
}

export function ScrapeForm({ onResult, onCrawlComplete, projectId, inProjectView = false }: ScrapeFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [crawlEntireSite, setCrawlEntireSite] = useState(false);
  const [maxPages, setMaxPages] = useState(10);
  const [projectName, setProjectName] = useState("");
  const [generateEmbeddings, setGenerateEmbeddings] = useState(true);

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
    
    // Add http:// if missing
    let processedUrl = url;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setLoading(true);
    
    try {
      const options = {
        crawlEntireSite,
        maxPages: maxPages,
        projectName: inProjectView ? undefined : projectName || ProjectService.getProjectNameFromUrl(processedUrl),
        generateEmbeddings: generateEmbeddings,
        useExistingProjectId: inProjectView ? projectId : undefined
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
              // We'll use a URL-based project name if none is provided
              projectId || undefined,
              inProjectView ? undefined : projectName || ProjectService.getProjectNameFromUrl(processedUrl)
            );
          }
          
          const embeddingsMessage = generateEmbeddings ? 
            " Content is now ready for AI chat." : 
            "";
            
          toast({
            title: "Crawling Complete",
            description: `${allResults.length} pages crawled successfully.${embeddingsMessage}`,
          });
        } else {
          const embeddingsMessage = generateEmbeddings ? 
            " AI embeddings were generated for this content." : 
            "";
            
          toast({
            title: "Success",
            description: `Website content illuminated successfully.${embeddingsMessage}`,
          });
        }
      }
    } finally {
      setLoading(false);
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
        
        <div className="flex items-center space-x-2">
          <Switch
            id="embedding-toggle"
            checked={generateEmbeddings}
            onCheckedChange={setGenerateEmbeddings}
          />
          <Label 
            htmlFor="embedding-toggle" 
            className="flex items-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Generate AI embeddings for chat
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
            
            {!inProjectView && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="project-name" className="min-w-[120px]">Project name:</Label>
                <Input
                  id="project-name"
                  type="text"
                  placeholder={ProjectService.getProjectNameFromUrl(url) || "My Project"}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex-1"
                />
              </div>
            )}
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
          {loading && crawlEntireSite && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => ScraperService.stopCrawling()}
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
