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
  const [useMemory, setUseMemory] = useState(true);
  const [usePromptChain, setUsePromptChain] = useState(true);
  const [qualityThreshold, setQualityThreshold] = useState(90);
  const [maxIterations, setMaxIterations] = useState(3);
  const [minQualityScore, setMinQualityScore] = useState(60);
  const [evaluation, setEvaluation] = useState<ChatEvaluation | undefined>(undefined);
  const [thinkActive, setThinkActive] = useState(false);
  const [useMultiAgent, setUseMultiAgent] = useState(true); // New state for multi-agent toggle
  const { toast } = useToast();
  
  // Send message function with multi-agent integration
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
        await saveMessageToDatabase(userMessage);
      }
      
      try {
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser();
        const isAuthenticated = !!user;
        
        let response;
        
        // Use multi-agent system for marketing-related queries
        if (useMultiAgent && (detectedTaskType === 'marketing' || detectedTaskType === 'email' || detectedTaskType === 'content')) {
          console.log('Using multi-agent system for enhanced marketing response');
          
          // Import and use multi-agent service
          const { MultiAgentService } = await import('@/services/MultiAgentService');
          
          const multiAgentResult = await MultiAgentService.processQuery(
            message,
            projectId,
            detectedTaskType,
            { isAuthenticated, thinkActive }
          );
          
          if (multiAgentResult.success) {
            // Transform multi-agent response to match expected format
            response = {
              message: multiAgentResult.response,
              threadId: threadId || crypto.randomUUID(),
              sources: multiAgentResult.sources,
              reasoning: multiAgentResult.reasoning.map(step => ({
                type: 'multi-agent',
                content: step
              })),
              confidence: multiAgentResult.confidence,
              evaluation: {
                iterations: 1,
                quality: multiAgentResult.quality.score * 100,
                evaluationHistory: [{
                  score: multiAgentResult.quality.score * 100,
                  feedback: multiAgentResult.quality.approved ? 'Quality approved by multi-agent system' : 'Quality improvements suggested'
                }]
              }
            };
            
            // Show quality improvements if not approved
            if (!multiAgentResult.quality.approved && multiAgentResult.quality.improvements.length > 0) {
              toast({
                title: "Quality Improvements Available",
                description: `${multiAgentResult.quality.improvements.length} suggestions for enhancing this response`,
              });
            }
          } else {
            // Fallback to regular agent service
            console.log('Multi-agent system failed, falling back to regular agent');
            response = await AgentService.sendMessage(
              message,
              threadId,
              projectId,
              {
                taskType: detectedTaskType,
                temperature: 0.7,
                maxTokens: 1500,
                modelName: "gpt-4o-mini",
                useMemory: isAuthenticated && !thinkActive,
                usePromptChain: usePromptChain || thinkActive,
                qualityThreshold: qualityThreshold,
                maxIterations: maxIterations,
                minQualityScore: minQualityScore,
                enableMultiStepReasoning: thinkActive
              }
            );
          }
        } else {
          // Use regular agent service for non-marketing queries or when multi-agent is disabled
          const shouldUseMemory = useMemory && isAuthenticated && !thinkActive;
          
          response = await AgentService.sendMessage(
            message,
            threadId,
            projectId,
            {
              taskType: detectedTaskType,
              temperature: 0.7,
              maxTokens: 1500,
              modelName: "gpt-4o-mini",
              useMemory: shouldUseMemory,
              usePromptChain: usePromptChain || thinkActive,
              qualityThreshold: qualityThreshold,
              maxIterations: maxIterations,
              minQualityScore: minQualityScore,
              enableMultiStepReasoning: thinkActive
            }
          );
        }
        
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
          await saveMessageToDatabase(assistantMessage);
        }
        
        // If this is a new conversation, call the callback with a new conversation ID
        if (!conversationId) {
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
    [projectId, threadId, conversationId, addMessage, onConversationCreated, toast, setLastSources, saveMessageToDatabase, useMemory, usePromptChain, qualityThreshold, maxIterations, minQualityScore, thinkActive, useMultiAgent]
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
    useMultiAgent, // Export the new state
    setUseMultiAgent, // Export the setter
    handleSendMessage
  };
}
