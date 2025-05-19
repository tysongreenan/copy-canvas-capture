
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as ChatMessageType, ChatService, ChatResponse } from "@/services/ChatService";
import { Loader2, Send } from "lucide-react";

interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export function ChatInterface({ 
  projectId, 
  conversationId: initialConversationId,
  onConversationCreated
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load existing messages if conversation ID is provided
  useEffect(() => {
    if (conversationId) {
      const loadMessages = async () => {
        setLoading(true);
        try {
          const fetchedMessages = await ChatService.getMessages(conversationId);
          setMessages(fetchedMessages);
        } catch (error) {
          console.error("Error loading messages:", error);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadMessages();
    }
  }, [conversationId, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: ChatMessageType = {
      role: 'user',
      content: input
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput("");
    
    try {
      // If we don't have a conversation ID yet, one will be created
      const { response, conversationId: newConversationId } = await ChatService.sendMessage(
        input, 
        projectId,
        conversationId,
        messages
      );
      
      // If this is a new conversation, update state and call the callback
      if (!conversationId && newConversationId) {
        setConversationId(newConversationId);
        if (onConversationCreated) {
          onConversationCreated(newConversationId);
        }
      }
      
      // Add AI response to UI
      const aiMessage: ChatMessageType = {
        role: 'assistant',
        content: response.response
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get a response",
        variant: "destructive"
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your request. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Start a conversation by sending a message.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex flex-row max-w-[80%] gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">AI</span>
                </div>
                <div className="bg-muted px-4 py-3 rounded-lg shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="resize-none"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
