
import { useState, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { AgentService, AgentStep } from "@/services/AgentService";
import { useToast } from "@/hooks/use-toast";
import { AgentTaskType, detectTaskType } from "@/utils/chatTaskDetection";

interface UseChatMessagingProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}

export function useChatMessaging({
  projectId,
  conversationId,
  onConversationCreated
}: UseChatMessagingProps) {
  const { 
    addMessage, 
    setLastSources, 
    saveMessageToDatabase 
  } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [reasoning, setReasoning] = useState<AgentStep[]>([]);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [taskType, setTaskType] = useState<AgentTaskType>('general');
  const { toast } = useToast();
  
  // Send message function
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      
      setIsLoading(true);
      
      // Reset reasoning state for new message
      setReasoning([]);
      
      // Detect task type
      const detectedTaskType = detectTaskType(message);
      setTaskType(detectedTaskType);
      
      // Create user message
      const userMessage: ChatMessageType = { 
        id: crypto.randomUUID(),
        conversation_id: conversationId || "",
        role: 'user', 
        content: message,
        created_at: new Date().toISOString()
      };
      
      // Add user message to the chat context
      addMessage(userMessage);
      
      // Save the message to the database if we have a conversation ID
      if (conversationId) {
        await saveMessageToDatabase(userMessage);
      }
      
      try {
        // Determine appropriate settings based on task type
        let temperature = 0.7;
        let maxTokens = 1500;
        let modelName = "gpt-4o-mini";
        
        if (detectedTaskType === 'email') {
          temperature = 0.5;
          maxTokens = 2000;
        } else if (detectedTaskType === 'marketing') {
          temperature = 0.6;
          maxTokens = 2000;
          modelName = "gpt-4o";
        } else if (detectedTaskType === 'summary') {
          temperature = 0.3;
          maxTokens = 1800;
        } else if (detectedTaskType === 'research') {
          temperature = 0.4;
          maxTokens = 1800;
          modelName = "gpt-4o";
        }
        
        // Send the message to the agent and get the response
        const response = await AgentService.sendMessage(
          message,
          threadId,
          projectId,
          {
            taskType: detectedTaskType,
            temperature: temperature,
            maxTokens: maxTokens,
            modelName: modelName
          }
        );
        
        // Save the thread ID for future messages
        if (response.threadId) {
          setThreadId(response.threadId);
        }
        
        // Store any sources if available
        if (response.sources && response.sources.length > 0) {
          setLastSources(response.sources);
        } else {
          setLastSources([]);
        }
        
        // Store reasoning steps if available
        if (response.reasoning && response.reasoning.length > 0) {
          setReasoning(response.reasoning);
        }
        
        // Store confidence score if available
        if (response.confidence !== undefined) {
          setConfidence(response.confidence);
        }
        
        // Create assistant message
        const assistantMessage: ChatMessageType = {
          id: crypto.randomUUID(),
          conversation_id: conversationId || "",
          role: 'assistant',
          content: response.message,
          created_at: new Date().toISOString()
        };
        
        // Add assistant's response to the chat context
        addMessage(assistantMessage);
        
        // Save the assistant message to the database if we have a conversation ID
        if (conversationId) {
          await saveMessageToDatabase(assistantMessage);
        }
        
        // If this is a new conversation, call the callback with a new conversation ID
        if (!conversationId) {
          // Call the callback to create a new conversation with the thread ID
          onConversationCreated(response.threadId);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, threadId, conversationId, addMessage, onConversationCreated, toast, setLastSources, saveMessageToDatabase]
  );

  return {
    isLoading,
    reasoning,
    confidence,
    taskType,
    handleSendMessage
  };
}
