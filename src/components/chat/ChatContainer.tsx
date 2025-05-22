
import { useState, useEffect } from "react";
import { ChatProvider } from '@/context/ChatContext';
import { ChatInterface } from "./ChatInterface";
import { ConversationsList } from "./ConversationsList";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Loader2, Menu, MessageSquare, X, Info } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmbeddingService } from "@/services/EmbeddingService";
import { useToast } from "@/hooks/use-toast";
import { ScraperService } from "@/services/ScraperService";
import { SavedProject } from "@/services/ContentService";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContentService } from "@/services/ContentService";

interface ChatContainerProps {
  project: SavedProject;
}

export function ChatContainer({ project }: ChatContainerProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [processingEmbeddings, setProcessingEmbeddings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<'none' | 'processing' | 'success' | 'partial' | 'no-content'>('none');
  const [projectPages, setProjectPages] = useState<any[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Check if the project already has embeddings
  useEffect(() => {
    const checkEmbeddings = async () => {
      try {
        const { count, error } = await supabase
          .from('document_chunks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);
          
        setHasEmbeddings(count !== null && count > 0);
      } catch (error) {
        console.error("Error checking embeddings:", error);
      }
    };
    
    checkEmbeddings();
    
    // Fetch project pages
    const fetchPages = async () => {
      try {
        const pages = await ContentService.getProjectPages(project.id);
        setProjectPages(pages);
      } catch (error) {
        console.error("Error fetching project pages:", error);
      }
    };
    
    fetchPages();
  }, [project.id]);
  
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
      const success = await EmbeddingService.processProject(project.id, scrapedPages);
      
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
  
  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
    setSidebarOpen(false);
  };
  
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };
  
  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
  };

  // Status Alert component
  const StatusAlert = () => {
    if (hasEmbeddings) return null;
    
    if (embeddingStatus === 'processing') {
      return (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertTitle>Processing content</AlertTitle>
          <AlertDescription>
            We're processing your content to make it available for AI chat. This may take a few moments.
          </AlertDescription>
        </Alert>
      );
    }

    if (embeddingStatus === 'no-content') {
      return (
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>No content available</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>No scraped content available to process. Please make sure you have crawled website content first.</p>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Content needs processing</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <p>Your website content needs to be processed before you can chat with it.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateEmbeddings}
            disabled={processingEmbeddings}
            className="w-fit"
          >
            {processingEmbeddings ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Content for Chat"
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Status Alert */}
      <div className="p-4">
        <StatusAlert />
      </div>
      
      <div className="flex border-t border-white/10 flex-1 h-full overflow-hidden">
        {/* Desktop: Regular sidebar, Mobile: Sheet sidebar */}
        {isMobile ? (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="absolute left-4 top-4 z-10">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium">Conversations</h3>
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ConversationsList
                  projectId={project.id}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-80 border-r border-white/10 hidden md:block">
            <ConversationsList
              projectId={project.id}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        )}
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-white/80" />
              <h2 className="font-medium text-white">Chat with {project.title || 'Website'}</h2>
            </div>
            
            {hasEmbeddings && embeddingStatus === 'success' && (
              <span className="text-xs flex items-center text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Content processed
              </span>
            )}
            
            {hasEmbeddings && embeddingStatus === 'partial' && (
              <span className="text-xs flex items-center text-amber-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Partially processed
              </span>
            )}
          </div>
          
          {/* Chat interface wrapped in provider */}
          <div className="flex-1 overflow-hidden">
            <ChatProvider>
              <ChatInterface 
                projectId={project.id} 
                conversationId={selectedConversationId}
                onConversationCreated={handleConversationCreated}
              />
            </ChatProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
