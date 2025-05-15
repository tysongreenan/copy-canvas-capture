
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScraperService } from "@/services/ScraperService";
import type { ScrapedContent } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";
import { Search, Upload } from "lucide-react";

interface ScrapeFormProps {
  onResult: (data: ScrapedContent) => void;
}

export function ScrapeForm({ onResult }: ScrapeFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

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
      const result = await ScraperService.scrapeWebsite(url);
      if (result) {
        onResult(result);
        toast({
          title: "Success",
          description: "Website content illuminated successfully",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
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
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="px-6 font-medium transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Go
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
        </div>
      </div>
    </form>
  );
}
