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
    reasoning.push('Initiating enhanced multi-agent workflow with RAG and memory integration');

    try {
      const agentResults: Record<string, AgentResponse> = {};

      // Phase 1: Thinking Agent with RAG integration (primary knowledge source)
      reasoning.push('Phase 1: Deep thinking analysis with integrated RAG knowledge retrieval');
      const thinkingResult = await this.thinkingAgent.process(context);
      agentResults.thinkingAgent = thinkingResult;
      
      let primarySources: any[] = [];
      if (thinkingResult.success && thinkingResult.data?.sources) {
        primarySources = thinkingResult.data.sources;
        reasoning.push(`Thinking agent retrieved ${primarySources.length} knowledge sources`);
      }

      // Phase 2: RAG Specialist for supplementary context (if needed)
      reasoning.push('Phase 2: Supplementary knowledge retrieval for additional context');
      const ragResult = await this.ragAgent.process(context);
      agentResults.ragSpecialist = ragResult;
      
      let supplementarySources: any[] = [];
      if (ragResult.success && ragResult.data?.sources) {
        supplementarySources = ragResult.data.sources;
        reasoning.push(`RAG specialist retrieved ${supplementarySources.length} additional sources`);
      }

      // Combine and deduplicate sources
      const allSources = this.deduplicateSources([...primarySources, ...supplementarySources]);
      reasoning.push(`Combined knowledge base: ${allSources.length} unique sources`);

      // Phase 3: Marketing Expert with enhanced context
      reasoning.push('Phase 3: Marketing expertise analysis with comprehensive knowledge context');
      const enhancedMarketingContext = {
        ...context,
        previousAgentResults: agentResults,
        consolidatedKnowledge: this.buildConsolidatedKnowledge(allSources, context)
      };
      
      const marketingResult = await this.marketingAgent.process(enhancedMarketingContext);
      agentResults.marketingExpert = marketingResult;

      // Phase 4: Quality Control validation
      reasoning.push('Phase 4: Quality control and ethics validation');
      const qualityContext = {
        ...context,
        previousAgentResults: agentResults
      };
      
      const qualityResult = await this.qualityAgent.process(qualityContext);
      agentResults.qualityControl = qualityResult;

      // Phase 5: Enhanced response synthesis with prominent RAG content
      reasoning.push('Phase 5: Response synthesis with prominent knowledge integration');
      const synthesizedResponse = await this.synthesizeEnhancedResponse(agentResults, context, allSources);
      
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
          memoryContextUsed: !!context.userContext?.memoryContext
        }
      };
    } catch (error) {
      reasoning.push(`Error in enhanced orchestration: ${error.message}`);
      return {
        success: false,
        confidence: 0,
        data: null,
        reasoning
      };
    }
  }

  private buildConsolidatedKnowledge(sources: any[], context: AgentContext): string {
    if (!sources.length) return '';

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

  private async synthesizeEnhancedResponse(
    agentResults: Record<string, AgentResponse>, 
    context: AgentContext, 
    allSources: any[]
  ): Promise<OrchestratedResponse> {
    const thinkingData = agentResults.thinkingAgent?.data;
    const ragData = agentResults.ragSpecialist?.data;
    const marketingData = agentResults.marketingExpert?.data;
    const qualityData = agentResults.qualityControl?.data;

    // Start with thinking agent's answer, enhanced with marketing insights
    let finalAnswer = thinkingData?.finalAnswer || 
                     marketingData?.insights?.analysis || 
                     'I apologize, but I encountered issues generating insights for your query.';

    // If we have sources, prominently feature them in the response
    if (allSources.length > 0) {
      finalAnswer += '\n\n**📋 This analysis is based on the following knowledge from your project:**\n';
      
      // Feature top 3 most relevant sources
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

    // Add thinking process if available
    if (thinkingData?.thinkingSession?.steps?.length > 0) {
      finalAnswer += '\n\n**🧠 My Analysis Process:**\n';
      thinkingData.thinkingSession.steps.slice(0, 3).forEach((step: any, index: number) => {
        finalAnswer += `${index + 1}. ${step.question}\n`;
        finalAnswer += `   ${step.conclusion}\n\n`;
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
        approved: qualityData?.approved || true,
        improvements: qualityData?.improvements || []
      },
      thinkingSteps: thinkingData?.thinkingSession?.steps || []
    };
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
    
    if (successfulAgents.length === 0) return 0;

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

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
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
