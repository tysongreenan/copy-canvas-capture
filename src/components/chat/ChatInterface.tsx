
import { useEffect } from "react";
import { useChat } from '@/context/ChatContext';
import { ChatService } from '@/services/ChatService';
import { useToast } from '@/hooks/use-toast';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatInterfaceProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export function ChatInterface({ 
  projectId, 
  conversationId,
  onConversationCreated
}: ChatInterfaceProps) {
  const { setMessages, setLoading, setSelectedConversationId } = useChat();
  const { toast } = useToast();
  
  // Set conversation ID in context when it changes
  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId, setSelectedConversationId]);
  
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
    } else {
      // Reset messages if no conversation is selected
      setMessages([]);
    }
  }, [conversationId, setLoading, setMessages, toast]);
  
  return (
    <div className="flex flex-col h-full bg-white">
      <MessageList />
      <ChatInput 
        projectId={projectId} 
        onConversationCreated={onConversationCreated} 
      />
    </div>
  );
}
