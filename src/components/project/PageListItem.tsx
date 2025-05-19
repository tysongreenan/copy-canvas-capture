
import { LinkIcon } from "lucide-react";
import { ScrapedContent } from "@/services/ScraperTypes";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScraperService } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";

interface PageListItemProps {
  page: ScrapedContent;
  isSelected: boolean;
  isMainUrl: (url: string) => boolean;
  getPathFromUrl: (url: string) => string;
  onSelect: () => void;
  projectId: string | undefined;
}

export const PageListItem = ({ 
  page, 
  isSelected, 
  isMainUrl, 
  getPathFromUrl, 
  onSelect,
  projectId
}: PageListItemProps) => {
  const [processingEmbeddings, setProcessingEmbeddings] = useState(false);
  
  const handleProcessEmbeddings = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent page selection when clicking the button
    
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing. Cannot process embeddings.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingEmbeddings(true);
    
    try {
      const success = await ScraperService.generateEmbeddingsForPage(page, projectId);
      
      if (success) {
        toast({
          title: "Embeddings Processed",
          description: "This page has been processed for AI chat.",
        });
      } else {
        toast({
          title: "Processing Failed",
          description: "Failed to process embeddings for this page.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error processing embeddings:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing embeddings.",
        variant: "destructive"
      });
    } finally {
      setProcessingEmbeddings(false);
    }
  };
  
  return (
    <div 
      onClick={onSelect}
      className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
        isSelected ? 'bg-indigo-50 border-indigo-200' : ''
      }`}
    >
      <div className="font-medium truncate">{page.title || getPathFromUrl(page.url)}</div>
      <div className="flex items-center text-xs text-gray-500 truncate">
        <LinkIcon className="h-3 w-3 mr-1" />
        {isMainUrl(page.url) ? '/' : getPathFromUrl(page.url)}
      </div>
      
      {/* Only show the process button if page title isn't "Error" */}
      {page.title !== "Error" && projectId && (
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-2 py-0 h-7"
            onClick={handleProcessEmbeddings}
            disabled={processingEmbeddings}
          >
            {processingEmbeddings ? "Processing..." : "Process for Chat"}
          </Button>
        </div>
      )}
    </div>
  );
};
