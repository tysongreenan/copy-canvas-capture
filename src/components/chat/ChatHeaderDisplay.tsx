
import React from "react";
import { MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

interface ChatHeaderDisplayProps {
  projectTitle: string;
  hasEmbeddings: boolean;
  embeddingStatus: 'none' | 'processing' | 'success' | 'partial' | 'no-content';
}

export function ChatHeaderDisplay({ 
  projectTitle, 
  hasEmbeddings, 
  embeddingStatus 
}: ChatHeaderDisplayProps) {
  return (
    <div className="p-4 border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-white/80" />
        <h2 className="font-medium text-white">Chat with {projectTitle || 'Website'}</h2>
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
  );
}
