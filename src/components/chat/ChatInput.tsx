
import { useChat } from '@/context/ChatContext';
import { ChatService } from '@/services/ChatService';
import { useToast } from '@/hooks/use-toast';
import { AI_Prompt } from "@/components/ui/animated-ai-input";

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
  
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = {
      role: 'user' as const,
      content: input.trim()
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Send message to API
      const { response, conversationId: newConversationId } = await ChatService.sendMessage(
        input.trim(), 
        projectId,
        selectedConversationId,
        messages
      );
      
      // If this created a new conversation, update the selected conversation ID
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
      setInput("");
      
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
  
  return (
    <div className="p-4 border-t border-gray-200">
      <AI_Prompt
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={loading}
      />
    </div>
  );
}
