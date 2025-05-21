import React, { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatService } from "@/services/ChatService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ projectId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { messages, addMessage, setMessages } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load existing messages when conversationId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;
      
      setIsLoading(true);
      try {
        const loadedMessages = await ChatService.getMessages(conversationId);
        setMessages(loadedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [conversationId, setMessages, toast]);
  
  // Send message function
  const handleSendMessage = useCallback(
    async (message: string, contentTypeFilter?: string | null) => {
      if (!message.trim()) return;
      
      setIsLoading(true);
      try {
        // Send the message and get the response
        const response = await ChatService.sendMessage(projectId, message, conversationId, contentTypeFilter);
        
        // If there's a new conversation ID, call the callback
        if (!conversationId && response.conversationId) {
          onConversationCreated(response.conversationId);
        }
        
        // Add user message to the chat context
        addMessage({ role: 'user', content: message });
        
        // Add assistant's response to the chat context
        addMessage({ role: 'assistant', content: response.response });
        
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
    [projectId, conversationId, addMessage, onConversationCreated, toast]
  );
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
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
