
import { useChat } from '@/context/ChatContext';
import { ChatService } from '@/services/ChatService';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, Send } from 'lucide-react';
import { Input } from "@/components/ui/input";

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
    setInput("");
    
    try {
      // If we don't have a conversation ID yet, one will be created
      const { response, conversationId: newConversationId } = await ChatService.sendMessage(
        input.trim(), 
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
  
  return (
    <div className="p-4 border-t border-gray-200 flex items-center gap-2">
      <button 
        className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask a question..."
        className="flex-1 bg-white text-black border-gray-200"
      />
      
      <button
        onClick={handleSend}
        disabled={loading || !input.trim()}
        className={`p-2 rounded-full transition-colors ${
          input.trim() 
            ? 'bg-primary text-white hover:bg-primary/90' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
