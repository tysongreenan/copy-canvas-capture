
import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/context/ChatContext";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatLoadingIndicator } from "@/components/chat/ChatLoadingIndicator";
import { ReasoningDisplay } from "@/components/chat/ReasoningDisplay";
import { useChatMessaging } from "@/hooks/use-chat-messaging";
import { getPlaceholderText } from "@/utils/chatTaskDetection";
import { AIChatInput } from "@/components/ui/ai-chat-input";

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
  const [inputValue, setInputValue] = useState("");
  
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

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue);
      setInputValue("");
    }
  };
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Messages area with padding at the bottom to prevent content from being hidden behind input */}
      <div className="flex-1 overflow-hidden pb-[140px]">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
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
      </div>
      
      {/* Fixed input area at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Separator className="bg-white/10" />
        <div className="p-4 bg-black/20 backdrop-blur-sm">
          <AIChatInput 
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            isLoading={isLoading}
            placeholder={getPlaceholderText(taskType)}
          />
        </div>
      </div>
    </div>
  );
}
