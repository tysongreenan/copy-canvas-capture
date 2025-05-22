
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";

interface ChatStatusAlertProps {
  hasEmbeddings: boolean;
  embeddingStatus: 'none' | 'processing' | 'success' | 'partial' | 'no-content';
  processingEmbeddings: boolean;
  onGenerateEmbeddings: () => void;
}

export function ChatStatusAlert({
  hasEmbeddings,
  embeddingStatus,
  processingEmbeddings,
  onGenerateEmbeddings
}: ChatStatusAlertProps) {
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
          onClick={onGenerateEmbeddings}
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
}
