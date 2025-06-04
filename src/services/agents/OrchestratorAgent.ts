
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { RAGSpecialistAgent } from './RAGSpecialistAgent';
import { MarketingExpertAgent } from './MarketingExpertAgent';
import { QualityControlAgent } from './QualityControlAgent';
import { ThinkingAgent } from './ThinkingAgent';

export interface OrchestratedResponse {
  finalAnswer: string;
  confidence: number;
  sources: any[];
  agentResults: Record<string, AgentResponse>;
  reasoning: string[];
  quality: {
    score: number;
    approved: boolean;
    improvements: string[];
  };
  thinkingSteps?: any[];
}

export class OrchestratorAgent extends BaseAgent {
  private ragAgent: RAGSpecialistAgent;
  private marketingAgent: MarketingExpertAgent;
  private qualityAgent: QualityControlAgent;
  private thinkingAgent: ThinkingAgent;

  constructor() {
    super('Orchestrator', 'Coordinates multi-agent collaboration and response synthesis');
    this.ragAgent = new RAGSpecialistAgent();
    this.marketingAgent = new MarketingExpertAgent();
    this.qualityAgent = new QualityControlAgent();
    this.thinkingAgent = new ThinkingAgent();
  }

  async process(context: AgentContext): Promise<AgentResponse> {
    const reasoning: string[] = [];
    reasoning.push('Initiating enhanced multi-agent workflow with improved error handling');

    try {
      const agentResults: Record<string, AgentResponse> = {};

      // Phase 1: RAG Specialist (primary knowledge source with fallbacks)
      reasoning.push('Phase 1: Knowledge retrieval with fallback mechanisms');
      const ragResult = await this.ragAgent.process(context);
      agentResults.ragSpecialist = ragResult;
      
      let allSources: any[] = [];
      if (ragResult.success && ragResult.data?.sources) {
        allSources = ragResult.data.sources;
        reasoning.push(`RAG specialist retrieved ${allSources.length} knowledge sources`);
      } else {
        reasoning.push('RAG specialist failed, proceeding with fallback strategies');
      }

      // Phase 2: Thinking Agent with RAG integration (if possible)
      reasoning.push('Phase 2: Deep thinking analysis with available knowledge');
      let thinkingResult: AgentResponse;
      
      try {
        thinkingResult = await this.thinkingAgent.process(context);
        agentResults.thinkingAgent = thinkingResult;
        
        if (thinkingResult.success && thinkingResult.data?.sources) {
          // Merge sources from thinking agent
          const thinkingSources = thinkingResult.data.sources;
          allSources = this.deduplicateSources([...allSources, ...thinkingSources]);
          reasoning.push(`Thinking agent added ${thinkingSources.length} additional sources`);
        }
      } catch (thinkingError) {
        reasoning.push(`Thinking agent failed: ${thinkingError.message}, continuing without deep analysis`);
        thinkingResult = {
          success: false,
          confidence: 0,
          data: null,
          reasoning: [`Failed: ${thinkingError.message}`]
        };
        agentResults.thinkingAgent = thinkingResult;
      }

      // Phase 3: Marketing Expert with enhanced context
      reasoning.push('Phase 3: Marketing expertise analysis with available context');
      const enhancedMarketingContext = {
        ...context,
        previousAgentResults: agentResults,
        consolidatedKnowledge: this.buildConsolidatedKnowledge(allSources, context)
      };
      
      const marketingResult = await this.marketingAgent.process(enhancedMarketingContext);
      agentResults.marketingExpert = marketingResult;

      // Phase 4: Quality Control validation
      reasoning.push('Phase 4: Quality control and response validation');
      const qualityContext = {
        ...context,
        previousAgentResults: agentResults
      };
      
      const qualityResult = await this.qualityAgent.process(qualityContext);
      agentResults.qualityControl = qualityResult;

      // Phase 5: Enhanced response synthesis with graceful degradation
      reasoning.push('Phase 5: Response synthesis with graceful degradation');
      const synthesizedResponse = await this.synthesizeRobustResponse(agentResults, context, allSources);
      
      const overallConfidence = this.calculateOverallConfidence(agentResults);
      reasoning.push(`Overall system confidence: ${Math.round(overallConfidence * 100)}%`);
      reasoning.push(`Knowledge sources integrated: ${allSources.length}`);

      return {
        success: true,
        confidence: overallConfidence,
        data: synthesizedResponse,
        reasoning,
        metadata: {
          agentCount: Object.keys(agentResults).length,
          qualityApproved: qualityResult.data?.approved || false,
          knowledgeSourceCount: allSources.length,
          hasThinkingSteps: thinkingResult.success && thinkingResult.data?.thinkingSession?.steps?.length > 0,
          memoryContextUsed: !!context.userContext?.memoryContext,
          fallbacksUsed: this.countFallbacks(agentResults)
        }
      };
    } catch (error) {
      reasoning.push(`Critical error in orchestration: ${error.message}`);
      return this.createEmergencyResponse(context, reasoning);
    }
  }

  private createEmergencyResponse(context: AgentContext, reasoning: string[]): AgentResponse {
    reasoning.push('Creating emergency response with basic marketing guidance');
    
    const emergencyResponse: OrchestratedResponse = {
      finalAnswer: this.generateEmergencyAnswer(context.query),
      confidence: 0.3,
      sources: [],
      agentResults: {},
      reasoning,
      quality: {
        score: 0.3,
        approved: false,
        improvements: ['System experienced technical difficulties']
      },
      thinkingSteps: []
    };

    return {
      success: true,
      confidence: 0.3,
      data: emergencyResponse,
      reasoning,
      metadata: {
        emergencyMode: true
      }
    };
  }

  private generateEmergencyAnswer(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('campaign') || lowerQuery.includes('advertising')) {
      return `For your advertising campaign question: "${query}", here are some general recommendations:

🎯 **Key Campaign Considerations:**
1. **Define Your Target Audience** - Know who you're trying to reach
2. **Set Clear Objectives** - What specific outcomes do you want?
3. **Choose the Right Channels** - Where does your audience spend time?
4. **Create Compelling Content** - Focus on benefits, not just features
5. **Test and Optimize** - Start small, measure results, and improve

📊 **Essential Metrics to Track:**
- Reach and impressions
- Click-through rates
- Conversion rates
- Cost per acquisition
- Return on ad spend (ROAS)

I apologize that our advanced AI system is temporarily experiencing technical difficulties. For more personalized advice, please try your question again in a few moments.`;
    }

    return `I understand you're asking about: "${query}"

While our advanced AI system is experiencing temporary technical difficulties, here are some general marketing principles that might help:

✅ **Universal Marketing Best Practices:**
1. **Know Your Audience** - Research demographics, preferences, and pain points
2. **Value Proposition** - Clearly communicate what makes you unique
3. **Multi-Channel Approach** - Use various touchpoints to reach customers
4. **Consistent Messaging** - Maintain brand voice across all platforms
5. **Data-Driven Decisions** - Track metrics and adjust based on performance

Please try your question again in a few moments when our system is fully operational.`;
  }

  private countFallbacks(agentResults: Record<string, AgentResponse>): number {
    let count = 0;
    Object.values(agentResults).forEach(result => {
      if (result.metadata?.retrievalMethod === 'keyword-fallback' || !result.success) {
        count++;
      }
    });
    return count;
  }

  private buildConsolidatedKnowledge(sources: any[], context: AgentContext): string {
    if (!sources.length) {
      return `Query: ${context.query}\n\nNo specific knowledge sources available. Proceeding with general marketing principles.`;
    }

    let knowledge = `Query: ${context.query}\n\n`;
    
    // Add memory context if available
    if (context.userContext?.memoryContext) {
      knowledge += `Previous Context:\n${context.userContext.memoryContext}\n\n`;
    }

    knowledge += 'Relevant Knowledge Base:\n\n';
    
    // Prioritize by relevance and quality
    const sortedSources = sources.sort((a, b) => {
      const scoreA = (a.weighted_score || a.similarity || 0) * (a.quality_score || 0.5);
      const scoreB = (b.weighted_score || b.similarity || 0) * (b.quality_score || 0.5);
      return scoreB - scoreA;
    });

    sortedSources.slice(0, 8).forEach((source, index) => {
      const confidence = Math.round((source.similarity || 0) * 100);
      const sourceType = source.source_type === 'global' ? '🌐 Global' : '📄 Project';
      knowledge += `${index + 1}. [${sourceType}] ${source.source_info || 'Content'} (${confidence}% relevance)\n`;
      knowledge += `${source.content}\n\n`;
    });

    return knowledge;
  }

  private async synthesizeRobustResponse(
    agentResults: Record<string, AgentResponse>, 
    context: AgentContext, 
    allSources: any[]
  ): Promise<OrchestratedResponse> {
    const thinkingData = agentResults.thinkingAgent?.data;
    const ragData = agentResults.ragSpecialist?.data;
    const marketingData = agentResults.marketingExpert?.data;
    const qualityData = agentResults.qualityControl?.data;

    // Build response with multiple fallback strategies
    let finalAnswer = '';
    
    if (thinkingData?.finalAnswer && !thinkingData.finalAnswer.includes('encountered an issue')) {
      finalAnswer = thinkingData.finalAnswer;
    } else if (marketingData?.insights?.analysis) {
      finalAnswer = marketingData.insights.analysis;
    } else if (allSources.length > 0) {
      finalAnswer = this.synthesizeFromSources(allSources, context.query);
    } else {
      finalAnswer = this.generateEmergencyAnswer(context.query);
    }

    // Enhanced source integration
    if (allSources.length > 0) {
      finalAnswer += '\n\n**📋 Knowledge Sources Used:**\n';
      
      const topSources = allSources
        .sort((a, b) => (b.weighted_score || b.similarity || 0) - (a.weighted_score || a.similarity || 0))
        .slice(0, 3);
        
      topSources.forEach((source, index) => {
        const confidence = Math.round((source.similarity || 0) * 100);
        const sourceType = source.source_type === 'global' ? 'Marketing Best Practice' : 'Your Content';
        finalAnswer += `\n${index + 1}. **${sourceType}** (${confidence}% relevance)\n`;
        finalAnswer += `   "${source.content.substring(0, 200)}..."\n`;
      });
    }

    // Add thinking process if available and successful
    if (thinkingData?.thinkingSession?.steps?.length > 0) {
      finalAnswer += '\n\n**🧠 Analysis Process:**\n';
      thinkingData.thinkingSession.steps.slice(0, 3).forEach((step: any, index: number) => {
        if (step.conclusion && !step.conclusion.includes('Unable to reach conclusion')) {
          finalAnswer += `${index + 1}. ${step.question}\n`;
          finalAnswer += `   ${step.conclusion}\n\n`;
        }
      });
    }

    // Add marketing recommendations if available
    if (marketingData?.recommendations?.length > 0) {
      finalAnswer += '\n\n**🎯 Strategic Recommendations:**\n';
      marketingData.recommendations.slice(0, 5).forEach((rec: string, index: number) => {
        finalAnswer += `${index + 1}. ${rec}\n`;
      });
    }

    // Add memory context acknowledgment
    if (context.userContext?.memoryContext) {
      finalAnswer += '\n\n💭 *This response incorporates insights from your previous conversations and project context.*';
    }

    return {
      finalAnswer,
      confidence: this.calculateOverallConfidence(agentResults),
      sources: allSources,
      agentResults,
      reasoning: this.combineReasoning(agentResults),
      quality: {
        score: qualityData?.qualityScore || 0.7,
        approved: qualityData?.approved !== false, // Default to true unless explicitly false
        improvements: qualityData?.improvements || []
      },
      thinkingSteps: thinkingData?.thinkingSession?.steps || []
    };
  }

  private synthesizeFromSources(sources: any[], query: string): string {
    const relevantContent = sources
      .filter(s => (s.similarity || 0) > 0.3)
      .slice(0, 5)
      .map(s => s.content)
      .join('\n\n');

    return `Based on the available knowledge sources, here's what I can tell you about "${query}":

${relevantContent}

**Key Takeaways:**
• Focus on understanding your target audience
• Ensure your messaging is clear and compelling
• Test different approaches to find what works best
• Monitor performance metrics to optimize results

This response is synthesized from your project's knowledge base and marketing best practices.`;
  }

  private deduplicateSources(sources: any[]): any[] {
    const seen = new Set();
    return sources.filter(source => {
      const key = source.content?.substring(0, 100) || source.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateOverallConfidence(agentResults: Record<string, AgentResponse>): number {
    const successfulAgents = Object.values(agentResults).filter(result => result.success);
    
    if (successfulAgents.length === 0) return 0.3; // Minimum confidence for emergency responses

    const weights = {
      thinkingAgent: 0.3,
      ragSpecialist: 0.2,
      marketingExpert: 0.3,
      qualityControl: 0.2
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(agentResults).forEach(([agentName, result]) => {
      if (result.success) {
        const weight = weights[agentName as keyof typeof weights] || 0.25;
        weightedSum += result.confidence * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.max(weightedSum / totalWeight, 0.3) : 0.3;
  }

  private combineReasoning(agentResults: Record<string, AgentResponse>): string[] {
    const combinedReasoning: string[] = [];

    Object.entries(agentResults).forEach(([agentName, result]) => {
      if (result.reasoning && result.reasoning.length > 0) {
        combinedReasoning.push(`--- ${agentName.toUpperCase()} REASONING ---`);
        combinedReasoning.push(...result.reasoning);
        combinedReasoning.push('');
      }
    });

    return combinedReasoning;
  }
}
