
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
    setMessages, 
    selectedConversationId, 
    setLastSources 
  } = useChat();
  const { toast } = useToast();
  
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    
    try {
      console.log("Sending message:", input.trim());
      
      // Send message to API
      const result = await ChatService.sendMessageToAPI(
        input.trim(), 
        projectId,
        selectedConversationId
      );
      
      console.log("Message sent, conversation ID:", result.conversationId);
      
      // If this created a new conversation, update the selected conversation ID
      if (!selectedConversationId && result.conversationId && onConversationCreated) {
        console.log("New conversation created:", result.conversationId);
        onConversationCreated(result.conversationId);
      }
      
      // Store sources if available
      if (result.sources && result.sources.length > 0) {
        setLastSources(result.sources);
      } else {
        setLastSources([]);
      }
      
      // Fetch the latest messages after sending
      if (result.conversationId) {
        console.log("Fetching updated messages");
        const updatedMessages = await ChatService.getMessages(result.conversationId);
        setMessages(updatedMessages);
      }
      
      setInput("");
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get a response",
        variant: "destructive"
      });
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
