
import { useChat } from '@/context/ChatContext';
import { AssistantService } from '@/services/AssistantService';
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
      // Get the assistant ID for the Marketing Research assistant
      const assistantId = AssistantService.getAssistantId("Marketing Research");
      
      // Use the AssistantService to send the message
      const result = await AssistantService.sendMessage(
        input.trim(), 
        selectedConversationId, 
        assistantId,
        projectId
      );
      
      // If a new conversation was created, notify the parent component
      if (!selectedConversationId && result.threadId && onConversationCreated) {
        onConversationCreated(result.threadId);
      }
      
      // Clear any sources since the Assistant API doesn't return sources
      setLastSources([]);
      
      // Update the UI with the new message
      if (selectedConversationId || result.threadId) {
        // Add the user message and assistant response to the UI immediately
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `temp-user-${Date.now()}`,
            conversation_id: selectedConversationId || result.threadId,
            role: 'user',
            content: input.trim(),
            created_at: new Date().toISOString()
          },
          {
            id: `temp-assistant-${Date.now()}`,
            conversation_id: selectedConversationId || result.threadId,
            role: 'assistant',
            content: result.message,
            created_at: new Date().toISOString()
          }
        ]);
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
