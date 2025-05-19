
import { useChat } from '@/context/ChatContext';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { ChatService } from '@/services/ChatService';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  projectId: string;
  onConversationCreated?: (id: string) => void;
}

export function ChatInput({ projectId, onConversationCreated }: ChatInputProps) {
  const { 
    input, 
    setInput, 
    loading, 
    setLoading, 
    messages, 
    setMessages, 
    selectedConversationId, 
    setLastSources 
  } = useChat();
  const { toast } = useToast();
  
  // Normalize text to help with handling typos and spelling mistakes
  const normalizeInput = (text: string): string => {
    return text.trim();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const normalizedInput = normalizeInput(input);
    
    const userMessage = {
      role: 'user' as const,
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
        selectedConversationId,
        messages
      );
      
      // If this is a new conversation, update state and call the callback
      if (!selectedConversationId && newConversationId && onConversationCreated) {
        onConversationCreated(newConversationId);
      }
      
      // Store sources if available
      if (response.sources && response.sources.length > 0) {
        setLastSources(response.sources);
      } else {
        setLastSources([]);
      }
      
      // Add AI response to UI
      const aiMessage = {
        role: 'assistant' as const,
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
          role: 'assistant' as const,
          content: "I'm sorry, I encountered an error while processing your request. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (newValue: string) => {
    setInput(newValue);
  };
  
  return (
    <div className="p-4">
      <AnimatedAIChat 
        value={input}
        onChange={handleInputChange}
        onSend={handleSend}
        isLoading={loading}
      />
    </div>
  );
}
