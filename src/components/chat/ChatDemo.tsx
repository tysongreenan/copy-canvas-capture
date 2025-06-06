
import { ChatProvider } from "@/context/ChatContext";
import { Sidebar } from "./Sidebar";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ChatInterface } from "./ChatInterface";
import { ChatHeader } from "./ChatHeader";
import { EmptyProjectState } from "./EmptyProjectState";
import { useProjectSelection } from "@/hooks/use-project-selection";
import { useEffect } from "react";

const ChatDemo = () => {
  const { id } = useParams<{ id: string }>();
  const { user, currentTeamId } = useAuth();
  const {
    projects,
    selectedProject,
    selectedConversationId,
    handleProjectSelect,
    handleConversationSelect,
    handleConversationCreated
  } = useProjectSelection(id, currentTeamId);
  
  // Move the authentication check after all hooks are initialized
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <ChatProvider>
      <div className="flex h-screen w-full bg-white">
        {/* Sidebar */}
        <Sidebar 
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleProjectSelect}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleConversationSelect}
        />
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedProject ? (
            <>
              {/* Chat header */}
              <ChatHeader selectedProject={selectedProject} />
              
              {/* Use ChatInterface which handles messages and input */}
              <ChatInterface 
                projectId={selectedProject.id}
                conversationId={selectedConversationId}
                onConversationCreated={handleConversationCreated}
              />
            </>
          ) : (
            <EmptyProjectState />
          )}
        </div>
      </div>
    </ChatProvider>
  );
};

export { ChatDemo };
