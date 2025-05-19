
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as ChatMessageType, ChatService, ChatResponse } from "@/services/ChatService";
import { Loader2, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

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
  
  // Normalize text to help with handling typos and spelling mistakes
  const normalizeInput = (text: string): string => {
    return text.trim();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const normalizedInput = normalizeInput(input);
    
    const userMessage: ChatMessageType = {
      role: 'user',
      content: normalizedInput
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput("");
    
    try {
      // If we don't have a conversation ID yet, one will be created
      const { response, conversationId: newConversationId } = await ChatService.sendMessage(
        normalizedInput, 
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
  
  return (
    <div className="flex flex-col h-full bg-gray-900">
      <ScrollArea className="flex-1 p-4 mb-4">
        <div className="space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-white/60">
                Start a conversation by sending a message. Ask questions about your website content.
              </p>
              <p className="text-sm text-white/40 mt-2">
                The AI is designed to handle typos and spelling mistakes, so don't worry about perfect spelling.
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
                      <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs flex items-center gap-1 text-white/60">
                        <BookOpen className="h-3 w-3" />
                        <span>View sources</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-60 overflow-auto p-4 bg-gray-800 text-white border-white/10" align="end">
                      <h4 className="font-medium mb-2 text-white">Sources</h4>
                      <div className="space-y-3">
                        {lastSources.map((source, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-primary/30 pl-2">
                            <div className="font-medium text-xs text-white/60 mb-1">
                              {source.metadata.title || source.metadata.source}
                            </div>
                            <p className="text-xs text-white/80">{source.content}</p>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4">
        <AnimatedAIChat 
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
