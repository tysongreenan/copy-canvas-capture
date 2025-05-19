
import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '@/services/ChatService';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedConversationId: string | undefined;
  setSelectedConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  lastSources: any[];
  setLastSources: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [lastSources, setLastSources] = useState<any[]>([]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        setLoading,
        selectedConversationId,
        setSelectedConversationId,
        input,
        setInput,
        lastSources,
        setLastSources
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
