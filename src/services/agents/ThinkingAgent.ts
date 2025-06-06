
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { supabase } from '@/integrations/supabase/client';

interface ThinkingStep {
  step: number;
  question: string;
  reasoning: string;
  conclusion: string;
  confidence: number;
}

interface ThinkingSession {
  query: string;
  context: string;
  steps: ThinkingStep[];
  finalAnswer: string;
  overallConfidence: number;
}

export class ThinkingAgent extends BaseAgent {
  constructor() {
    super('Thinking Agent', 'Deep reasoning and iterative self-prompting for accurate answers');
  }

  async process(context: AgentContext): Promise<AgentResponse> {
    const reasoning: string[] = [];
    reasoning.push('Initiating deep thinking workflow with RAG integration');

    try {
      // First, get knowledge context from RAG
      const ragContext = await this.getRAGContext(
        context.query,
        context.projectId,
        context.allowedCategories
      );
      reasoning.push(`Retrieved ${ragContext.sources.length} relevant knowledge sources`);

      // Start thinking session
      const thinkingSession = await this.conductThinkingSession(
        context.query, 
        ragContext.optimizedContext,
        context.taskType
      );

      reasoning.push(`Completed thinking session with ${thinkingSession.steps.length} reasoning steps`);
      reasoning.push(`Final confidence: ${Math.round(thinkingSession.overallConfidence * 100)}%`);

      return {
        success: true,
        confidence: thinkingSession.overallConfidence,
        data: {
          thinkingSession,
          sources: ragContext.sources,
          finalAnswer: thinkingSession.finalAnswer
        },
        reasoning,
        metadata: {
          thinkingSteps: thinkingSession.steps.length,
          ragSources: ragContext.sources.length
        }
      };
    } catch (error) {
      reasoning.push(`Error in thinking workflow: ${error.message}`);
      return {
        success: false,
        confidence: 0,
        data: null,
        reasoning
      };
    }
  }

  private async getRAGContext(
    query: string,
    projectId: string,
    categories?: string[]
  ): Promise<{
    sources: any[];
    optimizedContext: string;
  }> {
    try {
      // Generate embedding for the query
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke("generate-embedding", {
        body: { text: query }
      });

      if (embeddingError || !embeddingData?.embedding) {
        return { sources: [], optimizedContext: '' };
      }

      // Retrieve relevant documents
      const { data: sources, error: searchError } = await supabase.rpc('match_documents_quality_weighted', {
        query_embedding: embeddingData.embedding,
        match_threshold: 0.25,
        match_count: 10,
        p_project_id: projectId,
        include_global: true,
        p_min_quality_score: 60,
        p_categories: categories && categories.length > 0 ? categories : null
      });

      if (searchError || !sources) {
        return { sources: [], optimizedContext: '' };
      }

      // Optimize context for thinking
      const optimizedContext = this.optimizeContextForThinking(sources, query);

      return { sources, optimizedContext };
    } catch (error) {
      console.error('Error getting RAG context:', error);
      return { sources: [], optimizedContext: '' };
    }
  }

  private optimizeContextForThinking(sources: any[], query: string): string {
    if (!sources.length) return '';

    // Group by relevance and quality
    const highRelevance = sources.filter(s => (s.similarity || 0) > 0.6 && (s.quality_score || 0) > 70);
    const mediumRelevance = sources.filter(s => (s.similarity || 0) > 0.4 && (s.quality_score || 0) > 50);

    let context = `Query: ${query}\n\nRelevant Knowledge:\n\n`;

    if (highRelevance.length > 0) {
      context += 'HIGH CONFIDENCE SOURCES:\n';
      highRelevance.forEach((source, index) => {
        context += `${index + 1}. ${source.content.substring(0, 500)}...\n`;
        context += `   (Confidence: ${Math.round((source.similarity || 0) * 100)}%)\n\n`;
      });
    }

    if (mediumRelevance.length > 0) {
      context += 'SUPPORTING SOURCES:\n';
      mediumRelevance.forEach((source, index) => {
        context += `${index + 1}. ${source.content.substring(0, 300)}...\n`;
        context += `   (Confidence: ${Math.round((source.similarity || 0) * 100)}%)\n\n`;
      });
    }

    return context;
  }

  private async conductThinkingSession(
    query: string, 
    context: string, 
    taskType: string
  ): Promise<ThinkingSession> {
    const steps: ThinkingStep[] = [];
    let currentThinking = context;

    // Step 1: Initial analysis
    const step1 = await this.thinkingStep(
      1,
      `Given the query "${query}" and the provided context, what are the key aspects I need to consider?`,
      currentThinking,
      taskType
    );
    steps.push(step1);
    currentThinking += `\n\nStep 1 Analysis: ${step1.reasoning}\nConclusion: ${step1.conclusion}\n`;

    // Step 2: Deep dive
    const step2 = await this.thinkingStep(
      2,
      `Based on my initial analysis, what specific insights can I extract and what gaps in understanding do I need to address?`,
      currentThinking,
      taskType
    );
    steps.push(step2);
    currentThinking += `\n\nStep 2 Analysis: ${step2.reasoning}\nConclusion: ${step2.conclusion}\n`;

    // Step 3: Synthesis and validation
    const step3 = await this.thinkingStep(
      3,
      `Now I need to synthesize my understanding and validate my conclusions. What is the most accurate and helpful answer I can provide?`,
      currentThinking,
      taskType
    );
    steps.push(step3);

    // Generate final answer
    const finalAnswer = await this.generateFinalAnswer(query, steps, taskType);
    const overallConfidence = this.calculateOverallConfidence(steps);

    return {
      query,
      context,
      steps,
      finalAnswer,
      overallConfidence
    };
  }

  private async thinkingStep(
    stepNumber: number,
    question: string,
    context: string,
    taskType: string
  ): Promise<ThinkingStep> {
    try {
      const prompt = `
Context: ${context}

Thinking Step ${stepNumber}:
Question: ${question}

As an expert in ${taskType}, I need to think through this step by step:

1. What specific aspects of this question can I address with the given context?
2. What reasoning process should I follow?
3. What conclusion can I draw from this step?
4. How confident am I in this conclusion (0-100%)?

Please provide:
- REASONING: Your detailed thought process
- CONCLUSION: Your specific conclusion for this step
- CONFIDENCE: A percentage (0-100) of how confident you are
`;

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [
            { role: 'system', content: 'You are an expert analyst conducting deep reasoning. Provide thorough, step-by-step analysis.' },
            { role: 'user', content: prompt }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.3
        }
      });

      if (error || !data?.choices?.[0]?.message?.content) {
        throw new Error('Failed to generate thinking step');
      }

      const response = data.choices[0].message.content;
      
      // Parse the response to extract reasoning, conclusion, and confidence
      const reasoningMatch = response.match(/REASONING:\s*(.*?)(?=CONCLUSION:|$)/s);
      const conclusionMatch = response.match(/CONCLUSION:\s*(.*?)(?=CONFIDENCE:|$)/s);
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);

      return {
        step: stepNumber,
        question,
        reasoning: reasoningMatch?.[1]?.trim() || 'Unable to extract reasoning',
        conclusion: conclusionMatch?.[1]?.trim() || 'Unable to extract conclusion',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.5
      };
    } catch (error) {
      console.error(`Error in thinking step ${stepNumber}:`, error);
      return {
        step: stepNumber,
        question,
        reasoning: 'Error occurred during reasoning',
        conclusion: 'Unable to reach conclusion due to error',
        confidence: 0
      };
    }
  }

  private async generateFinalAnswer(
    query: string,
    steps: ThinkingStep[],
    taskType: string
  ): Promise<string> {
    try {
      const stepsContext = steps.map(step => 
        `Step ${step.step}: ${step.question}\nReasoning: ${step.reasoning}\nConclusion: ${step.conclusion}\nConfidence: ${Math.round(step.confidence * 100)}%\n`
      ).join('\n');

      const prompt = `
Original Query: ${query}

My thinking process:
${stepsContext}

Based on my step-by-step analysis above, provide a comprehensive final answer that:
1. Directly addresses the original query
2. Incorporates insights from all thinking steps
3. Is clear, actionable, and well-structured
4. Acknowledges any limitations or uncertainties

Focus on ${taskType} expertise and best practices.
`;

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [
            { role: 'system', content: `You are an expert in ${taskType}. Provide clear, actionable answers based on thorough analysis.` },
            { role: 'user', content: prompt }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.4
        }
      });

      if (error || !data?.choices?.[0]?.message?.content) {
        return 'I apologize, but I encountered an issue generating the final answer. Please try again.';
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating final answer:', error);
      return 'I apologize, but I encountered an issue generating the final answer. Please try again.';
    }
  }

  private calculateOverallConfidence(steps: ThinkingStep[]): number {
    if (steps.length === 0) return 0;
    
    const totalConfidence = steps.reduce((sum, step) => sum + step.confidence, 0);
    return totalConfidence / steps.length;
  }
}
