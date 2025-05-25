
import { useState, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatMessage as ChatMessageType } from "@/services/ChatService";
import { AgentService, AgentStep } from "@/services/AgentService";
import { useToast } from "@/hooks/use-toast";
import { AgentTaskType, detectTaskType } from "@/utils/chatTaskDetection";
import { supabase } from "@/integrations/supabase/client";

interface UseChatMessagingProps {
  projectId: string;
  conversationId?: string;
  onConversationCreated: (id: string) => void;
}

export interface ChatEvaluation {
  iterations: number;
  quality: number;
  evaluationHistory: Array<{
    score: number;
    feedback: string;
  }>;
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
  const [useMemory, setUseMemory] = useState(false); // Temporarily disabled
  const [usePromptChain, setUsePromptChain] = useState(true);
  const [qualityThreshold, setQualityThreshold] = useState(90);
  const [maxIterations, setMaxIterations] = useState(3);
  const [minQualityScore, setMinQualityScore] = useState(60);
  const [evaluation, setEvaluation] = useState<ChatEvaluation | undefined>(undefined);
  const [thinkActive, setThinkActive] = useState(false);
  const { toast } = useToast();
  
  // Send message function
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      
      setIsLoading(true);
      
      // Reset reasoning state for new message
      setReasoning([]);
      setEvaluation(undefined);
      
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
        try {
          await saveMessageToDatabase(userMessage);
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }
      
      try {
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser();
        const isAuthenticated = !!user;
        
        console.log(`Authentication status: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
        
        // Determine appropriate settings based on task type
        let temperature = 0.7;
        let maxTokens = 1500;
        let modelName = "gpt-4o-mini";
        let taskMinQuality = minQualityScore;
        
        if (detectedTaskType === 'email') {
          temperature = 0.5;
          maxTokens = 2000;
          taskMinQuality = Math.max(minQualityScore, 70);
        } else if (detectedTaskType === 'marketing') {
          temperature = 0.6;
          maxTokens = 2000;
          modelName = "gpt-4o";
          taskMinQuality = Math.max(minQualityScore, 70);
        } else if (detectedTaskType === 'summary') {
          temperature = 0.3;
          maxTokens = 1800;
          taskMinQuality = Math.max(minQualityScore, 65);
        } else if (detectedTaskType === 'research') {
          temperature = 0.4;
          maxTokens = 1800;
          modelName = "gpt-4o";
          taskMinQuality = Math.max(minQualityScore, 75);
        }
        
        console.log(`Task settings: type=${detectedTaskType}, model=${modelName}, temp=${temperature}`);
        
        // Send the message to the agent and get the response
        const response = await AgentService.sendMessage(
          message,
          threadId,
          projectId,
          {
            taskType: detectedTaskType,
            temperature: temperature,
            maxTokens: maxTokens,
            modelName: modelName,
            useMemory: false, // Temporarily disabled to prevent vector errors
            usePromptChain: usePromptChain || thinkActive,
            qualityThreshold: qualityThreshold,
            maxIterations: maxIterations,
            minQualityScore: taskMinQuality,
            enableMultiStepReasoning: thinkActive
          }
        );
        
        console.log("Agent response received:", response);
        
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

        // Store evaluation information if available
        if (response.evaluation) {
          setEvaluation(response.evaluation);
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
          try {
            await saveMessageToDatabase(assistantMessage);
          } catch (error) {
            console.error("Error saving assistant message:", error);
          }
        }
        
        // If this is a new conversation, call the callback with a new conversation ID
        if (!conversationId && response.threadId) {
          onConversationCreated(response.threadId);
        }
        
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: `Failed to send message: ${error.message}`,
          variant: "destructive"
        });
        
        // Create an error message to show in the chat
        const errorMessage: ChatMessageType = {
          id: crypto.randomUUID(),
          conversation_id: conversationId || "",
          role: 'assistant',
          content: "I apologize, but I encountered an error processing your message. Please try again.",
          created_at: new Date().toISOString()
        };
        addMessage(errorMessage);
        
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, threadId, conversationId, addMessage, onConversationCreated, toast, setLastSources, saveMessageToDatabase, useMemory, usePromptChain, qualityThreshold, maxIterations, minQualityScore, thinkActive]
  );

  return {
    isLoading,
    reasoning,
    confidence,
    taskType,
    useMemory,
    setUseMemory,
    usePromptChain,
    setUsePromptChain,
    qualityThreshold,
    setQualityThreshold,
    maxIterations,
    setMaxIterations,
    minQualityScore,
    setMinQualityScore,
    evaluation,
    thinkActive,
    setThinkActive,
    handleSendMessage
  };
}
