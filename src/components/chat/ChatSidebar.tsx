
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ConversationsList } from "./ConversationsList";

interface ChatSidebarProps {
  projectId: string;
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function ChatSidebar({
  projectId,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  isMobile,
  sidebarOpen,
  setSidebarOpen
}: ChatSidebarProps) {
  if (isMobile) {
    return (
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
              projectId={projectId}
              selectedConversationId={selectedConversationId}
              onSelectConversation={onSelectConversation}
              onNewConversation={onNewConversation}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className="w-80 border-r border-white/10 hidden md:block">
      <ConversationsList
        projectId={projectId}
        selectedConversationId={selectedConversationId}
        onSelectConversation={onSelectConversation}
        onNewConversation={onNewConversation}
      />
    </div>
  );
}
