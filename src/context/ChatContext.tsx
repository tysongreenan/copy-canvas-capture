
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ChatMessage, ChatService } from '@/services/ChatService';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentProjectId: string | undefined;
  setCurrentProjectId: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedConversationId: string | undefined;
  setSelectedConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  lastSources: any[];
  setLastSources: React.Dispatch<React.SetStateAction<any[]>>;
  messageLimit: number;
  loadMessagesForConversation: (conversationId: string) => Promise<void>;
  saveMessageToDatabase: (message: ChatMessage) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [lastSources, setLastSources] = useState<any[]>([]);
  const messageLimit = 100; // We can show up to 100 messages in the chat window

  // Add the addMessage function
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => {
      // If we're at the message limit, remove the oldest message
      if (prev.length >= messageLimit) {
        return [...prev.slice(1), message];
      }
      return [...prev, message];
    });
  };
  
  // Clear messages function
  const clearMessages = () => {
    setMessages([]);
  };
  
  // Load messages for a conversation from the database
  const loadMessagesForConversation = async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      const conversationMessages = await ChatService.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };
  
  // Save a message to the database
  const saveMessageToDatabase = async (message: ChatMessage) => {
    if (!selectedConversationId) return;
    
    try {
      await ChatService.sendMessage(
        selectedConversationId,
        message.role,
        message.content
      );
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };
  
  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      loadMessagesForConversation(selectedConversationId);
    } else {
      clearMessages();
    }
  }, [selectedConversationId]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        addMessage,
        clearMessages,
        loading,
        setLoading,
        currentProjectId,
        setCurrentProjectId,
        selectedConversationId,
        setSelectedConversationId,
        input,
        setInput,
        lastSources,
        setLastSources,
        messageLimit,
        loadMessagesForConversation,
        saveMessageToDatabase
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
