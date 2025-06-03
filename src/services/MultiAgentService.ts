
import { OrchestratorAgent, OrchestratedResponse } from './agents/OrchestratorAgent';
import { AgentContext } from './agents/BaseAgent';

export class MultiAgentService {
  private static orchestrator = new OrchestratorAgent();

  /**
   * Process a query using the multi-agent system
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
      console.log(`Processing query with multi-agent system: "${message}"`);
      console.log(`Project ID: ${projectId}, Task Type: ${taskType}`);

      const context: AgentContext = {
        query: message,
        projectId,
        taskType,
        userContext
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

      return {
        success: true,
        response: orchestratedData.finalAnswer,
        confidence: result.confidence,
        sources: orchestratedData.sources,
        reasoning: orchestratedData.reasoning,
        quality: orchestratedData.quality,
        metadata: result.metadata || {}
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
    return true; // Multi-agent system is always ready
  }
}
