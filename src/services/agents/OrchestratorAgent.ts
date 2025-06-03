
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { RAGSpecialistAgent } from './RAGSpecialistAgent';
import { MarketingExpertAgent } from './MarketingExpertAgent';
import { QualityControlAgent } from './QualityControlAgent';

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
}

export class OrchestratorAgent extends BaseAgent {
  private ragAgent: RAGSpecialistAgent;
  private marketingAgent: MarketingExpertAgent;
  private qualityAgent: QualityControlAgent;

  constructor() {
    super('Orchestrator', 'Coordinates multi-agent collaboration and response synthesis');
    this.ragAgent = new RAGSpecialistAgent();
    this.marketingAgent = new MarketingExpertAgent();
    this.qualityAgent = new QualityControlAgent();
  }

  async process(context: AgentContext): Promise<AgentResponse> {
    const reasoning: string[] = [];
    reasoning.push('Initiating multi-agent collaboration workflow');

    try {
      const agentResults: Record<string, AgentResponse> = {};

      // Phase 1: RAG Specialist retrieves and optimizes knowledge
      reasoning.push('Phase 1: Knowledge retrieval and context optimization');
      const ragResult = await this.ragAgent.process(context);
      agentResults.ragSpecialist = ragResult;
      
      if (!ragResult.success) {
        reasoning.push('RAG retrieval failed, proceeding with limited context');
      } else {
        reasoning.push(`RAG retrieval successful with confidence: ${Math.round(ragResult.confidence * 100)}%`);
      }

      // Phase 2: Marketing Expert generates insights
      reasoning.push('Phase 2: Marketing expertise and strategy analysis');
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

      // Phase 3: Quality Control validates recommendations
      reasoning.push('Phase 3: Quality control and ethics validation');
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

      // Phase 4: Synthesize final response
      reasoning.push('Phase 4: Response synthesis and final optimization');
      const synthesizedResponse = await this.synthesizeResponse(agentResults, context);
      
      // Calculate overall confidence
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
          hasKnowledgeContext: ragResult.success && ragResult.data?.sources?.length > 0
        }
      };
    } catch (error) {
      reasoning.push(`Error in orchestration: ${error.message}`);
      return {
        success: false,
        confidence: 0,
        data: null,
        reasoning
      };
    }
  }

  private async synthesizeResponse(agentResults: Record<string, AgentResponse>, context: AgentContext): Promise<OrchestratedResponse> {
    const ragData = agentResults.ragSpecialist?.data;
    const marketingData = agentResults.marketingExpert?.data;
    const qualityData = agentResults.qualityControl?.data;

    // Start with marketing insights as the base
    let finalAnswer = marketingData?.insights?.analysis || 'I apologize, but I encountered issues generating marketing insights for your query.';

    // Enhance with RAG sources if available
    const sources = ragData?.sources || [];
    if (sources.length > 0) {
      finalAnswer += '\n\n**Sources and Context:**\n';
      finalAnswer += `This analysis is based on ${sources.length} relevant sources from your knowledge base and marketing expertise.`;
    }

    // Add recommendations if available
    if (marketingData?.recommendations?.length > 0) {
      finalAnswer += '\n\n**Key Recommendations:**\n';
      marketingData.recommendations.forEach((rec: string, index: number) => {
        finalAnswer += `${index + 1}. ${rec}\n`;
      });
    }

    // Add quality improvements if needed
    if (qualityData?.improvements?.length > 0 && !qualityData.approved) {
      finalAnswer += '\n\n**Quality Improvements:**\n';
      finalAnswer += 'To enhance this marketing strategy, consider:\n';
      qualityData.improvements.forEach((improvement: string, index: number) => {
        finalAnswer += `• ${improvement}\n`;
      });
    }

    // Add brand voice considerations if available
    if (marketingData?.brandVoice) {
      finalAnswer += '\n\n**Brand Voice Alignment:**\n';
      finalAnswer += `This recommendation has been tailored to your brand's ${marketingData.brandVoice.tone} tone and ${marketingData.brandVoice.style} style.`;
    }

    return {
      finalAnswer,
      confidence: this.calculateOverallConfidence(agentResults),
      sources,
      agentResults,
      reasoning: this.combineReasoning(agentResults),
      quality: {
        score: qualityData?.qualityScore || 0.5,
        approved: qualityData?.approved || false,
        improvements: qualityData?.improvements || []
      }
    };
  }

  private calculateOverallConfidence(agentResults: Record<string, AgentResponse>): number {
    const successfulAgents = Object.values(agentResults).filter(result => result.success);
    
    if (successfulAgents.length === 0) return 0;

    // Weighted average of agent confidences
    const weights = {
      ragSpecialist: 0.3,
      marketingExpert: 0.4,
      qualityControl: 0.3
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
