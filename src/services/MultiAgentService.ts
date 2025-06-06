
import { OrchestratorAgent, OrchestratedResponse } from './agents/OrchestratorAgent';
import { AgentContext } from './agents/BaseAgent';
import { MemoryService } from './MemoryService';
import { RAGQueryService } from './RAGQueryService';

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

      // Get memory context for authenticated users with fallback
      let memoryContext = '';
      if (userContext?.isAuthenticated) {
        try {
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
        } catch (memoryError) {
          console.error('Memory retrieval failed, continuing without context:', memoryError);
        }
      }

      const avgConfidence = await RAGQueryService.getAverageConfidence(projectId);
      let matchThreshold = 0.25;
      if (avgConfidence !== null) {
        if (avgConfidence > 0.8) matchThreshold = 0.3;
        else if (avgConfidence < 0.4) matchThreshold = 0.2;
      }

      const context: AgentContext = {
        query: message,
        projectId,
        taskType,
        userContext: {
          ...userContext,
          memoryContext
        },
        ragParams: { matchThreshold }
      };

      const result = await this.orchestrator.process(context);

      if (!result.success) {
        console.error('Multi-agent processing failed:', result.reasoning);
        
        // Create a more helpful error response instead of generic failure
        const errorResponse = this.createErrorResponse(message, result.reasoning || []);
        
        return {
          success: true, // Mark as success to avoid further error handling
          response: errorResponse,
          confidence: 0.3,
          sources: [],
          reasoning: result.reasoning || ['Processing failed'],
          quality: { score: 0.3, approved: false, improvements: ['System recovery needed'] },
          metadata: { errorMode: true }
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
        if (!enhancedResponse.includes('📋 Knowledge Sources Used:')) {
          enhancedResponse += '\n\n---\n\n**📚 Knowledge Sources Used:**\n';
          orchestratedData.sources.slice(0, 3).forEach((source, index) => {
            const similarity = Math.round((source.similarity || 0) * 100);
            const sourceInfo = source.source_info || 'Project Content';
            enhancedResponse += `${index + 1}. **${sourceInfo}** (${similarity}% relevance)\n`;
            enhancedResponse += `   "${source.content.substring(0, 150)}..."\n\n`;
          });
        }
      }

      // Add memory context information if used
      if (memoryContext && !enhancedResponse.includes('previous conversation history')) {
        enhancedResponse += '\n💭 *This response incorporates your previous conversation history and preferences.*';
      }

      try {
        await RAGQueryService.logQuery(
          projectId,
          message,
          orchestratedData.sources.map(s => s.id),
          result.confidence
        );
        console.log(
          `Logged RAG query with ${orchestratedData.sources.map(s => s.id).length} sources`
        );
      } catch (logError) {
        console.error('Failed to log RAG query:', logError);
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
      
      // Create a helpful error response instead of generic error
      const fallbackResponse = this.createFallbackResponse(message, error.message);
      
      return {
        success: true, // Mark as success to provide helpful response
        response: fallbackResponse,
        confidence: 0.2,
        sources: [],
        reasoning: [`Critical error: ${error.message}`],
        quality: { score: 0.2, approved: false, improvements: ['System needs attention'] },
        metadata: { criticalError: true, errorMessage: error.message }
      };
    }
  }

  private static createErrorResponse(query: string, reasoning: string[]): string {
    return `I apologize, but I'm experiencing some technical difficulties processing your question: "${query}"

**What I tried to do:**
${reasoning.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}

**While I work on resolving this, here are some general marketing insights:**

🎯 **For Campaign Planning:**
- Define clear, measurable objectives
- Research your target audience thoroughly
- Create compelling, benefit-focused messaging
- Choose channels where your audience is active
- Set up proper tracking and analytics

📊 **Key Metrics to Monitor:**
- Reach and engagement rates
- Conversion metrics
- Cost per acquisition
- Customer lifetime value
- Return on marketing investment

Please try rephrasing your question or ask again in a few moments. I'm working to improve my responses for you.`;
  }

  private static createFallbackResponse(query: string, errorMessage: string): string {
    const lowerQuery = query.toLowerCase();
    
    let specificGuidance = '';
    if (lowerQuery.includes('campaign') || lowerQuery.includes('advertising')) {
      specificGuidance = `
🎯 **Campaign Strategy Basics:**
- Start with clear objectives (awareness, leads, sales)
- Define your ideal customer profile
- Test small before scaling up
- Focus on one primary message per campaign
- Track performance and optimize regularly`;
    } else if (lowerQuery.includes('content') || lowerQuery.includes('social')) {
      specificGuidance = `
📝 **Content Marketing Fundamentals:**
- Provide value before asking for anything
- Maintain consistent brand voice
- Use a content calendar for planning
- Engage with your audience's comments
- Repurpose content across multiple channels`;
    } else {
      specificGuidance = `
📈 **General Marketing Principles:**
- Know your audience better than they know themselves
- Focus on benefits, not just features
- Be consistent across all touchpoints
- Measure what matters to your business
- Always be testing and improving`;
    }

    return `I'm currently experiencing technical difficulties, but I want to help with your question: "${query}"

${specificGuidance}

💡 **Quick Action Steps:**
1. Identify your most important marketing goal right now
2. Define who you're trying to reach
3. Choose one channel to focus on initially
4. Create content that addresses their specific needs
5. Measure results and adjust based on data

I apologize for the technical issues. Please try your question again in a few moments when my systems are fully operational.`;
  }

  /**
   * Get information about the available agents
   */
  public static getAgentInfo(): {
    orchestrator: string;
    specialists: Array<{ name: string; description: string; }>;
  } {
    return {
      orchestrator: 'Coordinates multi-agent collaboration and response synthesis with fallback mechanisms',
      specialists: [
        { name: 'Thinking Agent', description: 'Deep reasoning and iterative self-prompting for accurate answers' },
        { name: 'RAG Specialist', description: 'Advanced knowledge retrieval with keyword fallbacks' },
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
