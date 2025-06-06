
import { useState, useEffect } from "react";
import { EmbeddingService } from "@/services/EmbeddingService";
import { ContentService } from "@/services/ContentService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmbeddingProgress } from "@/hooks/use-embedding-progress";

export function useEmbeddings(projectId: string) {
  const [processingEmbeddings, setProcessingEmbeddings] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<'none' | 'processing' | 'success' | 'partial' | 'no-content'>('none');
  const [progress, setProgress] = useState(0);
  const [projectPages, setProjectPages] = useState<any[]>([]);
  const { toast } = useToast();
  const { data: progressData } = useEmbeddingProgress(projectId, processingEmbeddings);

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

  useEffect(() => {
    if (!progressData) return;

    if (progressData.total > 0) {
      const pct = Math.round((progressData.done / progressData.total) * 100);
      setProgress(pct);
    }

    if (processingEmbeddings && progressData.total > 0 && progressData.done >= progressData.total) {
      setProcessingEmbeddings(false);
      setHasEmbeddings(true);
      setEmbeddingStatus(progressData.failed > 0 ? 'partial' : 'success');
    }
  }, [progressData, processingEmbeddings]);

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
      
      await EmbeddingService.processProject(projectId, scrapedPages);
      setProgress(0);
      toast({
        title: "Jobs queued",
        description: "Embedding jobs have been queued for processing"
      });
    } catch (error) {
      console.error("Error generating embeddings:", error);
      toast({
        title: "Error",
        description: "Failed to generate embeddings",
        variant: "destructive"
      });
      setEmbeddingStatus('none');
    } finally {
      // keep processing state until jobs finish
    }
  };

  return {
    processingEmbeddings,
    hasEmbeddings,
    embeddingStatus,
    progress,
    handleGenerateEmbeddings
  };
}
