
import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/context/ChatContext";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLoadingIndicator } from "@/components/chat/ChatLoadingIndicator";
import { ReasoningDisplay } from "@/components/chat/ReasoningDisplay";
import { useChatMessaging } from "@/hooks/use-chat-messaging";
import { getPlaceholderText } from "@/utils/chatTaskDetection";

interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ 
  projectId, 
  conversationId, 
  onConversationCreated 
}: ChatInterfaceProps) {
  const { messages, setCurrentProjectId, setSelectedConversationId } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    isLoading,
    reasoning,
    confidence,
    taskType,
    handleSendMessage
  } = useChatMessaging({
    projectId,
    conversationId,
    onConversationCreated
  });
  
  // Update current project ID and conversation ID in context
  useEffect(() => {
    setCurrentProjectId(projectId);
    setSelectedConversationId(conversationId);
  }, [projectId, conversationId, setCurrentProjectId, setSelectedConversationId]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        setTimeout(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message}
            />
          ))}
          
          <ChatLoadingIndicator isLoading={isLoading} taskType={taskType} />
          
          {reasoning.length > 0 && messages.length > 0 && !isLoading && (
            <ReasoningDisplay 
              reasoning={reasoning}
              confidence={confidence}
            />
          )}
        </div>
      </ScrollArea>
      
      <Separator className="bg-white/10" />
      
      <div className="p-4 bg-black/20">
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={getPlaceholderText(taskType)}
        />
      </div>
    </div>
  );
}
