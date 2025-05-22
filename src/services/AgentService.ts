
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
  type: string;
  content: string;
  toolName?: string;
  toolOutput?: any;
}

export interface AgentSource {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
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
        useMemory: true, // Enable memory by default
        usePromptChain: true, // Enable prompt chain by default
        qualityThreshold: 90, // 90% quality threshold
        maxIterations: 3, // Max 3 iterations
      };

      // Special cases for different task types
      if (options.taskType === 'email') {
        defaultOptions.temperature = 0.5; // Lower temperature for more consistent email generation
        defaultOptions.maxTokens = 2000; // More tokens for emails
      } else if (options.taskType === 'summary') {
        defaultOptions.temperature = 0.3; // Even lower temperature for summaries
        defaultOptions.maxTokens = 1800; // More tokens for comprehensive summaries
      } else if (options.taskType === 'research') {
        defaultOptions.modelName = "gpt-4o"; // Use more powerful model for research
        defaultOptions.enableTools = true; // Ensure tools are enabled for research
        defaultOptions.temperature = 0.4; // Lower temperature for more factual responses
      } else if (options.taskType === 'marketing' || options.taskType === 'content') {
        defaultOptions.modelName = "gpt-4o"; // Use more powerful model for marketing
        defaultOptions.enableTools = true; // Ensure tools are enabled for marketing
        defaultOptions.temperature = 0.6; // Balanced temperature for creative yet factual content
        defaultOptions.maxTokens = 2000; // More tokens for comprehensive marketing guidance
      }
      
      // Merge with user options, with user options taking precedence
      const finalOptions = { ...defaultOptions, ...options };
      
      console.log(`Agent options: Task Type: ${finalOptions.taskType}, Model: ${finalOptions.modelName}`);
      console.log(`Prompt Chain: ${finalOptions.usePromptChain}, Quality Threshold: ${finalOptions.qualityThreshold}%, Max Iterations: ${finalOptions.maxIterations}`);

      // Get relevant memories if memory is enabled and we have a project ID and the user is authenticated
      let memories = [];
      if (finalOptions.useMemory && projectId) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Fetching relevant memories for user and project");
          memories = await MemoryService.getRelevantMemories(
            user.id,
            projectId,
            message,
            3,  // Limit to 3 most relevant memories
            0.6  // Similarity threshold
          );
          console.log(`Found ${memories.length} relevant memories`);
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
          memories: memories, // Pass memories to the agent
          usePromptChain: finalOptions.usePromptChain,
          qualityThreshold: finalOptions.qualityThreshold,
          maxIterations: finalOptions.maxIterations
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
