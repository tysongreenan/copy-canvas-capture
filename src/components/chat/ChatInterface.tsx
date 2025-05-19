
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as ChatMessageType, ChatService, ChatResponse } from "@/services/ChatService";
import { Loader2, Send, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatSource {
  content: string;
  similarity: number;
  metadata: {
    source: string;
    title?: string;
    type: string;
  };
}

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
  const [lastSources, setLastSources] = useState<ChatSource[]>([]);
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
      
      // Store sources if available
      if (response.sources && response.sources.length > 0) {
        setLastSources(response.sources);
      } else {
        setLastSources([]);
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
                Start a conversation by sending a message. Ask questions about your website content.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className="group">
              <ChatMessage message={message} />
              
              {/* Show sources button after AI messages if sources are available */}
              {message.role === 'assistant' && 
               index === messages.length - 1 && 
               lastSources.length > 0 && (
                <div className="mt-1 flex justify-end opacity-70 hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>View sources</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-60 overflow-auto p-4" align="end">
                      <h4 className="font-medium mb-2">Sources</h4>
                      <div className="space-y-3">
                        {lastSources.map((source, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-primary/30 pl-2">
                            <div className="font-medium text-xs text-muted-foreground mb-1">
                              {source.metadata.title || source.metadata.source}
                            </div>
                            <p className="text-xs">{source.content}</p>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
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
            placeholder="Ask a question about your website content..."
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
