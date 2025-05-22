
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function useConversation() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
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
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return {
    selectedConversationId,
    sidebarOpen,
    isMobile,
    handleNewConversation,
    handleSelectConversation,
    handleConversationCreated,
    toggleSidebar,
    setSidebarOpen
  };
}
