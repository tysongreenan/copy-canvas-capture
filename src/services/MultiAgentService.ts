
import { OrchestratorAgent, OrchestratedResponse } from './agents/OrchestratorAgent';
import { AgentContext } from './agents/BaseAgent';
import { MemoryService } from './MemoryService';

export class MultiAgentService {
  private static orchestrator = new OrchestratorAgent();

  /**
   * Process a query using the multi-agent system with enhanced RAG and memory integration
   */
  public static async processQuery(
    message: string,
    projectId: string,
    taskType: string = 'marketing',
    userContext?: any
  ): Promise<{
    success: boolean;
    response: string;
    confidence: number;
    sources: any[];
    reasoning: string[];
    quality: {
      score: number;
      approved: boolean;
      improvements: string[];
    };
    metadata: any;
  }> {
    try {
      console.log(`Processing query with enhanced multi-agent system: "${message}"`);
      console.log(`Project ID: ${projectId}, Task Type: ${taskType}`);

      // Get memory context for authenticated users
      let memoryContext = '';
      if (userContext?.isAuthenticated) {
        const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
        if (user) {
          const marketingInsights = await MemoryService.getMarketingInsights(
            user.id,
            projectId,
            message,
            true
          );
          memoryContext = marketingInsights.combined;
          console.log(`Retrieved memory context: ${memoryContext ? 'Yes' : 'No'}`);
        }
      }

      const context: AgentContext = {
        query: message,
        projectId,
        taskType,
        userContext: {
          ...userContext,
          memoryContext
        }
      };

      const result = await this.orchestrator.process(context);

      if (!result.success) {
        console.error('Multi-agent processing failed:', result.reasoning);
        return {
          success: false,
          response: 'I encountered an issue processing your request. Please try again.',
          confidence: 0,
          sources: [],
          reasoning: result.reasoning || ['Processing failed'],
          quality: { score: 0, approved: false, improvements: [] },
          metadata: {}
        };
      }

      const orchestratedData = result.data as OrchestratedResponse;

      console.log(`Multi-agent processing completed with confidence: ${Math.round(result.confidence * 100)}%`);
      console.log(`Quality approved: ${orchestratedData.quality.approved}`);
      console.log(`Sources retrieved: ${orchestratedData.sources.length}`);

      // Enhanced response with prominent RAG content display
      let enhancedResponse = orchestratedData.finalAnswer;
      
      // Add source information prominently if available
      if (orchestratedData.sources.length > 0) {
        enhancedResponse += '\n\n---\n\n**📚 Knowledge Sources Used:**\n';
        orchestratedData.sources.slice(0, 3).forEach((source, index) => {
          const similarity = Math.round((source.similarity || 0) * 100);
          const sourceInfo = source.source_info || 'Project Content';
          enhancedResponse += `${index + 1}. **${sourceInfo}** (${similarity}% relevance)\n`;
          enhancedResponse += `   "${source.content.substring(0, 150)}..."\n\n`;
        });
      }

      // Add memory context information if used
      if (memoryContext) {
        enhancedResponse += '\n💭 *This response incorporates your previous conversation history and preferences.*';
      }

      return {
        success: true,
        response: enhancedResponse,
        confidence: result.confidence,
        sources: orchestratedData.sources,
        reasoning: orchestratedData.reasoning,
        quality: orchestratedData.quality,
        metadata: {
          ...result.metadata,
          memoryUsed: !!memoryContext,
          sourceCount: orchestratedData.sources.length
        }
      };
    } catch (error) {
      console.error('Error in multi-agent service:', error);
      return {
        success: false,
        response: 'An unexpected error occurred while processing your request.',
        confidence: 0,
        sources: [],
        reasoning: [`Error: ${error.message}`],
        quality: { score: 0, approved: false, improvements: [] },
        metadata: { error: true }
      };
    }
  }

  /**
   * Get information about the available agents
   */
  public static getAgentInfo(): {
    orchestrator: string;
    specialists: Array<{ name: string; description: string; }>;
  } {
    return {
      orchestrator: 'Coordinates multi-agent collaboration and response synthesis',
      specialists: [
        { name: 'Thinking Agent', description: 'Deep reasoning and iterative self-prompting for accurate answers' },
        { name: 'RAG Specialist', description: 'Advanced knowledge retrieval and context optimization' },
        { name: 'Marketing Expert', description: 'Specialized marketing strategy and campaign optimization' },
        { name: 'Quality Control', description: 'Marketing ethics and best practices validation' }
      ]
    };
  }

  /**
   * Check if the multi-agent system is ready
   */
  public static isReady(): boolean {
    return true;
  }
}
