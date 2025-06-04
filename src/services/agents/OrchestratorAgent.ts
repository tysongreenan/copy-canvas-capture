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
    reasoning.push('Initiating enhanced multi-agent workflow with deep thinking');

    try {
      const agentResults: Record<string, AgentResponse> = {};

      // Phase 1: Deep thinking analysis with RAG integration
      reasoning.push('Phase 1: Deep thinking analysis with knowledge integration');
      const thinkingResult = await this.thinkingAgent.process(context);
      agentResults.thinkingAgent = thinkingResult;
      
      if (!thinkingResult.success) {
        reasoning.push('Deep thinking analysis failed, proceeding with standard workflow');
      } else {
        reasoning.push(`Deep thinking completed with confidence: ${Math.round(thinkingResult.confidence * 100)}%`);
      }

      // Phase 2: RAG Specialist for additional context (if thinking didn't provide enough)
      reasoning.push('Phase 2: Additional knowledge retrieval and context optimization');
      const ragResult = await this.ragAgent.process(context);
      agentResults.ragSpecialist = ragResult;
      
      if (!ragResult.success) {
        reasoning.push('RAG retrieval failed, proceeding with available context');
      } else {
        reasoning.push(`RAG retrieval successful with confidence: ${Math.round(ragResult.confidence * 100)}%`);
      }

      // Phase 3: Marketing Expert generates insights based on thinking and RAG
      reasoning.push('Phase 3: Marketing expertise and strategy analysis');
      const marketingContext = {
        ...context,
        previousAgentResults: agentResults
      };
      
      const marketingResult = await this.marketingAgent.process(marketingContext);
      agentResults.marketingExpert = marketingResult;
      
      if (!marketingResult.success) {
        reasoning.push('Marketing analysis encountered issues');
      } else {
        reasoning.push(`Marketing analysis completed with confidence: ${Math.round(marketingResult.confidence * 100)}%`);
      }

      // Phase 4: Quality Control validates recommendations
      reasoning.push('Phase 4: Quality control and ethics validation');
      const qualityContext = {
        ...context,
        previousAgentResults: agentResults
      };
      
      const qualityResult = await this.qualityAgent.process(qualityContext);
      agentResults.qualityControl = qualityResult;
      
      if (!qualityResult.success) {
        reasoning.push('Quality control validation failed');
      } else {
        reasoning.push(`Quality validation completed with score: ${Math.round(qualityResult.confidence * 100)}%`);
      }

      // Phase 5: Synthesize final response with thinking integration
      reasoning.push('Phase 5: Response synthesis with deep thinking integration');
      const synthesizedResponse = await this.synthesizeEnhancedResponse(agentResults, context);
      
      const overallConfidence = this.calculateOverallConfidence(agentResults);
      reasoning.push(`Overall system confidence: ${Math.round(overallConfidence * 100)}%`);

      return {
        success: true,
        confidence: overallConfidence,
        data: synthesizedResponse,
        reasoning,
        metadata: {
          agentCount: Object.keys(agentResults).length,
          qualityApproved: qualityResult.data?.approved || false,
          hasKnowledgeContext: ragResult.success && ragResult.data?.sources?.length > 0,
          hasThinkingSteps: thinkingResult.success && thinkingResult.data?.thinkingSession?.steps?.length > 0
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

  private async synthesizeEnhancedResponse(agentResults: Record<string, AgentResponse>, context: AgentContext): Promise<OrchestratedResponse> {
    const thinkingData = agentResults.thinkingAgent?.data;
    const ragData = agentResults.ragSpecialist?.data;
    const marketingData = agentResults.marketingExpert?.data;
    const qualityData = agentResults.qualityControl?.data;

    // Start with thinking agent's final answer if available, otherwise use marketing insights
    let finalAnswer = thinkingData?.finalAnswer || 
                     marketingData?.insights?.analysis || 
                     'I apologize, but I encountered issues generating insights for your query.';

    // If we have thinking steps, enhance the answer with the reasoning process
    if (thinkingData?.thinkingSession?.steps?.length > 0) {
      finalAnswer += '\n\n**My Reasoning Process:**\n';
      thinkingData.thinkingSession.steps.forEach((step: any, index: number) => {
        finalAnswer += `${index + 1}. ${step.question}\n`;
        finalAnswer += `   ${step.conclusion} (Confidence: ${Math.round(step.confidence * 100)}%)\n\n`;
      });
    }

    // Combine sources from thinking and RAG
    const allSources = [
      ...(thinkingData?.sources || []),
      ...(ragData?.sources || [])
    ];

    // Remove duplicates based on content similarity
    const uniqueSources = this.deduplicateSources(allSources);

    if (uniqueSources.length > 0) {
      finalAnswer += '\n\n**Knowledge Sources:**\n';
      finalAnswer += `This analysis is based on ${uniqueSources.length} relevant sources from your knowledge base and expert reasoning.`;
    }

    // Add marketing recommendations if available
    if (marketingData?.recommendations?.length > 0) {
      finalAnswer += '\n\n**Strategic Recommendations:**\n';
      marketingData.recommendations.forEach((rec: string, index: number) => {
        finalAnswer += `${index + 1}. ${rec}\n`;
      });
    }

    // Add quality improvements if needed
    if (qualityData?.improvements?.length > 0 && !qualityData.approved) {
      finalAnswer += '\n\n**Quality Enhancement Suggestions:**\n';
      qualityData.improvements.forEach((improvement: string) => {
        finalAnswer += `• ${improvement}\n`;
      });
    }

    return {
      finalAnswer,
      confidence: this.calculateOverallConfidence(agentResults),
      sources: uniqueSources,
      agentResults,
      reasoning: this.combineReasoning(agentResults),
      quality: {
        score: qualityData?.qualityScore || 0.5,
        approved: qualityData?.approved || false,
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

    // Weighted average of agent confidences
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
