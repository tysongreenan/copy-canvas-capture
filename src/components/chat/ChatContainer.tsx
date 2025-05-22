
import React from "react";
import { ChatProvider } from '@/context/ChatContext';
import { ChatInterface } from "./ChatInterface";
import { ChatHeaderDisplay } from "./ChatHeaderDisplay";
import { ChatStatusAlert } from "./ChatStatusAlert";
import { ChatSidebar } from "./ChatSidebar";
import { SavedProject } from "@/services/ContentService";
import { useEmbeddings } from "@/hooks/use-embeddings";
import { useConversation } from "@/hooks/use-conversation";

interface ChatContainerProps {
  project: SavedProject;
}

export function ChatContainer({ project }: ChatContainerProps) {
  // Custom hooks for managing state
  const {
    processingEmbeddings,
    hasEmbeddings,
    embeddingStatus,
    handleGenerateEmbeddings
  } = useEmbeddings(project.id);
  
  const {
    selectedConversationId,
    sidebarOpen,
    isMobile,
    handleNewConversation,
    handleSelectConversation,
    handleConversationCreated,
    setSidebarOpen
  } = useConversation();

  return (
    <div className="flex flex-col h-full">
      {/* Status Alert */}
      <div className="p-4">
        <ChatStatusAlert
          hasEmbeddings={hasEmbeddings}
          embeddingStatus={embeddingStatus}
          processingEmbeddings={processingEmbeddings}
          onGenerateEmbeddings={handleGenerateEmbeddings}
        />
      </div>
      
      <div className="flex border-t border-white/10 flex-1 h-full overflow-hidden">
        {/* Sidebar Component */}
        <ChatSidebar
          projectId={project.id}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <ChatHeaderDisplay
            projectTitle={project.title}
            hasEmbeddings={hasEmbeddings}
            embeddingStatus={embeddingStatus}
          />
          
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
