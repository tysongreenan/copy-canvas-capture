
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScraperService } from "@/services/ScraperService";
import type { ScrapedContent } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";
import { Beam } from "lucide-react";

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
        description: "Please enter a website URL to scrape",
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
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Input
          type="text"
          placeholder="Enter website URL (e.g., example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="px-8 font-medium transition-all duration-200 bg-primary hover:bg-primary/90"
        >
          {loading ? "Illuminating..." : "Illuminate Content"}
        </Button>
      </div>
    </form>
  );
}
