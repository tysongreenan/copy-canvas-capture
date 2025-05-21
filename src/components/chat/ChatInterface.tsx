
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentService } from "@/services/AgentService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ projectId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { messages, addMessage, setLastSources } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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
  
  // Send message function
  const handleSendMessage = useCallback(
    async (message: string, contentTypeFilter?: string | null) => {
      if (!message.trim()) return;
      
      setIsLoading(true);
      
      // Add user message to the chat context
      addMessage({ 
        id: crypto.randomUUID(),
        conversation_id: conversationId || "",
        role: 'user', 
        content: message,
        created_at: new Date().toISOString()
      });
      
      try {
        // Send the message to the agent and get the response
        const response = await AgentService.sendMessage(
          message,
          threadId,
          projectId,
          contentTypeFilter
        );
        
        // Save the thread ID for future messages
        if (response.threadId) {
          setThreadId(response.threadId);
        }
        
        // Store any sources if available
        if (response.sources && response.sources.length > 0) {
          setLastSources(response.sources);
        } else {
          setLastSources([]);
        }
        
        // Add assistant's response to the chat context
        addMessage({
          id: crypto.randomUUID(),
          conversation_id: conversationId || "",
          role: 'assistant',
          content: response.message,
          created_at: new Date().toISOString()
        });
        
        // If this is a new conversation, call the callback with a new conversation ID
        if (!conversationId) {
          // TODO: In a real implementation, we would save the conversation to the database
          // and get back a real conversation ID. For now, we're just using the threadId.
          onConversationCreated(response.threadId);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, threadId, conversationId, addMessage, onConversationCreated, toast, setLastSources]
  );
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Thinking...</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading}
          placeholder="Type your message here..."
        />
      </div>
    </div>
  );
}
