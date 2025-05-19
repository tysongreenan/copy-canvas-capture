
import { useState, useEffect } from "react";
import { ChatInterface } from "./ChatInterface";
import { ConversationsList } from "./ConversationsList";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Loader2, Menu, MessageSquare, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmbeddingService } from "@/services/EmbeddingService";
import { useToast } from "@/hooks/use-toast";
import { ScraperService } from "@/services/ScraperService";
import { SavedProject } from "@/services/ContentService";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatContainerProps {
  project: SavedProject;
}

export function ChatContainer({ project }: ChatContainerProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [processingEmbeddings, setProcessingEmbeddings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<'none' | 'processing' | 'success' | 'partial'>('none');
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
  }, [project.id]);
  
  const handleGenerateEmbeddings = async () => {
    setProcessingEmbeddings(true);
    setEmbeddingStatus('processing');
    
    try {
      // Get all pages for this project
      const pages = await ScraperService.getAllResults();
      
      if (!pages || pages.length === 0) {
        toast({
          title: "No content",
          description: "No scraped content available to process",
          variant: "destructive"
        });
        setEmbeddingStatus('none');
        return;
      }
      
      toast({
        title: "Processing",
        description: `Processing ${pages.length} pages for AI chat...`
      });
      
      // Process embeddings
      const success = await EmbeddingService.processProject(project.id, pages);
      
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

  // Status alert component
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
    
    return (
      <Alert variant="warning" className="mb-4">
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
    <div className="flex flex-col h-[calc(100vh-13rem)]">
      {/* Status Alert */}
      <StatusAlert />
      
      <div className="flex border rounded-lg overflow-hidden flex-1">
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
          <div className="w-80 border-r hidden md:block">
            <ConversationsList
              projectId={project.id}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        )}
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-medium">Chat with {project.title || 'Website'}</h2>
            </div>
            
            {hasEmbeddings && embeddingStatus === 'success' && (
              <span className="text-xs flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Content processed
              </span>
            )}
            
            {hasEmbeddings && embeddingStatus === 'partial' && (
              <span className="text-xs flex items-center text-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Partially processed
              </span>
            )}
          </div>
          
          {/* Chat interface */}
          <div className="flex-1">
            <ChatInterface 
              projectId={project.id} 
              conversationId={selectedConversationId}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
