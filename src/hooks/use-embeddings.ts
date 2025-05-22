
import { useState, useEffect } from "react";
import { EmbeddingService } from "@/services/EmbeddingService";
import { ContentService } from "@/services/ContentService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useEmbeddings(projectId: string) {
  const [processingEmbeddings, setProcessingEmbeddings] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<'none' | 'processing' | 'success' | 'partial' | 'no-content'>('none');
  const [projectPages, setProjectPages] = useState<any[]>([]);
  const { toast } = useToast();

  // Check if the project already has embeddings
  useEffect(() => {
    const checkEmbeddings = async () => {
      try {
        const { count, error } = await supabase
          .from('document_chunks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId);
          
        setHasEmbeddings(count !== null && count > 0);
      } catch (error) {
        console.error("Error checking embeddings:", error);
      }
    };
    
    checkEmbeddings();
    
    // Fetch project pages
    const fetchPages = async () => {
      try {
        const pages = await ContentService.getProjectPages(projectId);
        setProjectPages(pages);
      } catch (error) {
        console.error("Error fetching project pages:", error);
      }
    };
    
    fetchPages();
  }, [projectId]);

  const handleGenerateEmbeddings = async () => {
    setProcessingEmbeddings(true);
    setEmbeddingStatus('processing');
    
    try {
      // Get all pages for this project
      if (!projectPages || projectPages.length === 0) {
        toast({
          title: "No content",
          description: "No scraped content available to process",
          variant: "destructive"
        });
        setEmbeddingStatus('no-content');
        setProcessingEmbeddings(false);
        return;
      }
      
      // Convert database records to ScrapedContent format
      const scrapedPages = projectPages.map(page => {
        // Safely type the content object
        const contentObj = page.content as {
          headings: Array<{tag: string; text: string}>;
          paragraphs: string[];
          links: Array<{url: string; text: string}>;
          listItems: string[];
          metaDescription: string;
          metaKeywords: string;
        };
        
        // Convert the database record to ScrapedContent format
        return {
          url: page.url,
          title: page.title || "",
          headings: contentObj.headings || [],
          paragraphs: contentObj.paragraphs || [],
          links: contentObj.links || [],
          listItems: contentObj.listItems || [],
          metaDescription: contentObj.metaDescription || "",
          metaKeywords: contentObj.metaKeywords || ""
        };
      });
      
      toast({
        title: "Processing",
        description: `Processing ${scrapedPages.length} pages for AI chat...`
      });
      
      // Process embeddings
      const success = await EmbeddingService.processProject(projectId, scrapedPages);
      
      if (success) {
        setHasEmbeddings(true);
        setEmbeddingStatus('success');
        toast({
          title: "Success",
          description: "Content processed successfully. You can now chat with your data."
        });
      } else {
        setHasEmbeddings(true);
        setEmbeddingStatus('partial');
        toast({
          title: "Partial success",
          description: "Some content could not be processed. You can still chat with the processed data."
        });
      }
    } catch (error) {
      console.error("Error generating embeddings:", error);
      toast({
        title: "Error",
        description: "Failed to generate embeddings",
        variant: "destructive"
      });
      setEmbeddingStatus('none');
    } finally {
      setProcessingEmbeddings(false);
    }
  };

  return {
    processingEmbeddings,
    hasEmbeddings,
    embeddingStatus,
    handleGenerateEmbeddings
  };
}
