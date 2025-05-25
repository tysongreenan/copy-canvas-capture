
import { supabase } from "@/integrations/supabase/client";
import { MemoryService } from "./MemoryService";

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentTool {
  type: string;
  name: string;
  description: string;
  parameters?: any;
}

export interface AgentStep {
  type: string;  // Changed from step_type to type to match usage in ReasoningDisplay
  content: string;
  toolName?: string;
  toolOutput?: any;
}

export interface AgentSource {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
  quality_score?: number;
  weighted_score?: number;
  source_type?: string;
  source_info?: string;
}

export interface AgentEvaluation {
  iterations: number;
  quality: number;
  evaluationHistory: Array<{
    score: number;
    feedback: string;
  }>;
}

export interface AgentResponse {
  message: string;
  threadId: string;
  reasoning?: AgentStep[];
  contentTypeFilter?: string | null;
  sources?: AgentSource[];
  confidence?: number;
  evaluation?: AgentEvaluation;
}

export type AgentTaskType = 'general' | 'email' | 'summary' | 'research' | 'marketing' | 'content';

export interface AgentRequestOptions {
  taskType?: AgentTaskType;
  contentTypeFilter?: string | null;
  enableTools?: boolean;
  enableMultiStepReasoning?: boolean;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  useMemory?: boolean;
  usePromptChain?: boolean;
  qualityThreshold?: number;
  maxIterations?: number;
  minQualityScore?: number; // New option for minimum quality filtering
}

export class AgentService {
  /**
   * Send a message to the AI agent and get a response with reasoning steps
   */
  public static async sendMessage(
    message: string, 
    threadId?: string,
    projectId?: string,
    options: AgentRequestOptions = {}
  ): Promise<AgentResponse> {
    try {
      console.log(`Sending agent message. Thread ID: ${threadId}, Project ID: ${projectId}`);
      
      // Merge default options with provided options
      const defaultOptions: AgentRequestOptions = {
        taskType: 'general',
        contentTypeFilter: null,
        enableTools: true,
        enableMultiStepReasoning: true,
        modelName: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 1500,
        useMemory: true,
        usePromptChain: true,
        qualityThreshold: 90,
        maxIterations: 3,
        minQualityScore: 60, // Default minimum quality score (60%)
      };

      // Special cases for different task types
      if (options.taskType === 'email') {
        defaultOptions.temperature = 0.5;
        defaultOptions.maxTokens = 2000;
        defaultOptions.minQualityScore = 70; // Higher quality for emails
      } else if (options.taskType === 'summary') {
        defaultOptions.temperature = 0.3;
        defaultOptions.maxTokens = 1800;
        defaultOptions.minQualityScore = 65;
      } else if (options.taskType === 'research') {
        defaultOptions.modelName = "gpt-4o";
        defaultOptions.enableTools = true;
        defaultOptions.temperature = 0.4;
        defaultOptions.minQualityScore = 75; // Higher quality for research
      } else if (options.taskType === 'marketing' || options.taskType === 'content') {
        defaultOptions.modelName = "gpt-4o";
        defaultOptions.enableTools = true;
        defaultOptions.temperature = 0.6;
        defaultOptions.maxTokens = 2000;
        defaultOptions.minQualityScore = 70; // Higher quality for marketing
      }
      
      // Merge with user options, with user options taking precedence
      const finalOptions = { ...defaultOptions, ...options };
      
      console.log(`Agent options: Task Type: ${finalOptions.taskType}, Model: ${finalOptions.modelName}`);
      console.log(`Quality settings: Min Quality: ${finalOptions.minQualityScore}%, Quality Threshold: ${finalOptions.qualityThreshold}%`);

      // Get relevant memories if memory is enabled and we have a project ID and the user is authenticated
      let memories = [];
      if (finalOptions.useMemory && projectId) {
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log("Fetching relevant memories for user and project");
            memories = await MemoryService.getRelevantMemories(
              user.id,
              projectId,
              message,
              3,
              0.6
            );
            console.log(`Found ${memories.length} relevant memories`);
          }
        } catch (memoryError) {
          console.error("Error fetching memories, continuing without them:", memoryError);
        }
      }

      // Call the Supabase edge function that handles agent communication
      const { data, error } = await supabase.functions.invoke("agent-chat", {
        body: {
          message,
          threadId,
          projectId,
          taskType: finalOptions.taskType,
          contentTypeFilter: finalOptions.contentTypeFilter,
          enableTools: finalOptions.enableTools,
          enableMultiStepReasoning: finalOptions.enableMultiStepReasoning,
          modelName: finalOptions.modelName,
          temperature: finalOptions.temperature,
          maxTokens: finalOptions.maxTokens,
          memories: memories,
          usePromptChain: finalOptions.usePromptChain,
          qualityThreshold: finalOptions.qualityThreshold,
          maxIterations: finalOptions.maxIterations,
          minQualityScore: finalOptions.minQualityScore // Pass minimum quality score
        }
      });
      
      if (error) {
        console.error("Error sending message to agent:", error);
        throw new Error(`Failed to get response from agent: ${error.message}`);
      }
      
      console.log("Agent response received:", data);
      return data as AgentResponse;
    } catch (error: any) {
      console.error("Error in agent service:", error);
      throw new Error(`Agent error: ${error.message}`);
    }
  }

  /**
   * Store the conversation as a memory after it's completed
   */
  public static async storeConversationMemory(
    conversationId: string,
    projectId: string
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found, cannot store conversation memory");
        return false;
      }
      
      // Fetch all messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (messagesError || !messages || messages.length === 0) {
        console.error("Failed to fetch conversation messages:", messagesError);
        return false;
      }
      
      // Format the messages for the summarization API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Generate a summary of the conversation
      const summary = await MemoryService.summarizeConversation(formattedMessages);
      
      // Store the summary as a memory
      const summaryId = await MemoryService.storeConversationSummary(
        user.id,
        projectId,
        conversationId,
        summary
      );
      
      return summaryId !== null;
    } catch (error) {
      console.error("Error storing conversation memory:", error);
      return false;
    }
  }
}
