
import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '@/services/ChatService';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (message: ChatMessage) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedConversationId: string | undefined;
  setSelectedConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  lastSources: any[];
  setLastSources: React.Dispatch<React.SetStateAction<any[]>>;
  messageLimit: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        addMessage,
        loading,
        setLoading,
        selectedConversationId,
        setSelectedConversationId,
        input,
        setInput,
        lastSources,
        setLastSources,
        messageLimit
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
