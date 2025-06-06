
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { supabase } from '@/integrations/supabase/client';

export class MarketingExpertAgent extends BaseAgent {
  constructor() {
    super('Marketing Expert', 'Specialized marketing strategy and campaign optimization');
  }

  async process(context: AgentContext): Promise<AgentResponse> {
    const reasoning: string[] = [];
    reasoning.push('Analyzing marketing context and strategy requirements');

    try {
      // Get RAG context from previous agent
      const ragData = context.previousAgentResults?.ragSpecialist?.data;
      const sources = ragData?.sources || [];
      const optimizedContext = ragData?.optimizedContext || '';

      reasoning.push(`Working with ${sources.length} knowledge sources`);

      // Analyze marketing intent
      const marketingIntent = this.analyzeMarketingIntent(context.query);
      reasoning.push(`Detected marketing intent: ${marketingIntent.category}`);

      // Brand voice analysis (if available)
      const brandVoice = await this.analyzeBrandVoice(context.projectId);
      if (brandVoice) {
        reasoning.push('Applied brand voice consistency analysis');
      }

      // Generate marketing-specific prompts, injecting brand voice if present
      const marketingPrompt = this.buildMarketingPrompt(
        context.query,
        optimizedContext,
        marketingIntent,
        brandVoice
      );
      reasoning.push('Built specialized marketing analysis prompt');

      // Get marketing insights using OpenAI
      const marketingInsights = await this.generateMarketingInsights(marketingPrompt);
      reasoning.push('Generated marketing insights and recommendations');

      const confidence = this.calculateMarketingConfidence(marketingInsights, sources, marketingIntent);
      reasoning.push(`Marketing expertise confidence: ${Math.round(confidence * 100)}%`);

      return {
        success: true,
        confidence,
        data: {
          insights: marketingInsights,
          intent: marketingIntent,
          brandVoice,
          recommendations: this.generateRecommendations(marketingInsights, marketingIntent),
          sources: sources.length
        },
        reasoning,
        metadata: {
          marketingCategory: marketingIntent.category,
          hasContextSources: sources.length > 0,
          hasBrandVoice: !!brandVoice
        }
      };
    } catch (error) {
      reasoning.push(`Error in marketing analysis: ${error.message}`);
      return {
        success: false,
        confidence: 0,
        data: null,
        reasoning
      };
    }
  }

  private analyzeMarketingIntent(query: string): { category: string; subcategory: string; confidence: number } {
    const marketingKeywords = {
      'strategy': ['strategy', 'plan', 'approach', 'framework', 'methodology'],
      'campaign': ['campaign', 'promotion', 'launch', 'advertising', 'ads'],
      'content': ['content', 'copy', 'messaging', 'blog', 'social'],
      'seo': ['seo', 'search', 'keywords', 'ranking', 'optimization'],
      'email': ['email', 'newsletter', 'automation', 'sequence', 'drip'],
      'social': ['social', 'facebook', 'instagram', 'twitter', 'linkedin'],
      'analytics': ['analytics', 'metrics', 'roi', 'performance', 'tracking'],
      'branding': ['brand', 'identity', 'voice', 'positioning', 'perception']
    };

    let bestMatch = { category: 'general', subcategory: 'general', confidence: 0 };
    const queryLower = query.toLowerCase();

    for (const [category, keywords] of Object.entries(marketingKeywords)) {
      const matches = keywords.filter(keyword => queryLower.includes(keyword)).length;
      const confidence = matches / keywords.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { category, subcategory: category, confidence };
      }
    }

    return bestMatch;
  }

  private buildMarketingPrompt(
    query: string,
    context: string,
    intent: any,
    brandVoice?: any
  ): string {
    const basePrompt = `You are a senior marketing strategist with expertise in ${intent.category} marketing.`;
    
    const contextSection = context ? `\n\nRelevant Context:\n${context}` : '';

    let brandVoiceSection = '';
    if (brandVoice) {
      const voiceParts = [] as string[];
      if (brandVoice.tone) voiceParts.push(`Tone: ${brandVoice.tone}`);
      if (brandVoice.style) voiceParts.push(`Style: ${brandVoice.style}`);
      if (brandVoice.audience) voiceParts.push(`Primary Audience: ${brandVoice.audience}`);
      if (voiceParts.length) {
        brandVoiceSection = `\n\nBrand Voice Guidelines:\n${voiceParts.join('\n')}`;
      }
    }
    
    const expertisePrompt = {
      'strategy': 'Focus on strategic planning, market analysis, competitive positioning, and long-term growth.',
      'campaign': 'Focus on campaign development, audience targeting, channel selection, and performance optimization.',
      'content': 'Focus on content strategy, messaging frameworks, storytelling, and engagement optimization.',
      'seo': 'Focus on SEO strategy, keyword optimization, technical SEO, and search visibility.',
      'email': 'Focus on email marketing strategy, automation, segmentation, and conversion optimization.',
      'social': 'Focus on social media strategy, community building, engagement, and platform optimization.',
      'analytics': 'Focus on marketing analytics, KPI development, ROI measurement, and data-driven insights.',
      'branding': 'Focus on brand strategy, positioning, messaging, and brand experience design.'
    };

    return `${basePrompt}

${expertisePrompt[intent.category] || expertisePrompt['strategy']}

Please analyze the following marketing question and provide expert insights:
${query}${contextSection}${brandVoiceSection}

Provide specific, actionable recommendations based on current marketing best practices.`;
  }

  private async generateMarketingInsights(prompt: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('agent-chat', {
        body: {
          message: prompt,
          modelName: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 1500,
          enableMultiStepReasoning: false
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        analysis: data.message,
        confidence: data.confidence || 0.8,
        reasoning: data.reasoning || []
      };
    } catch (error) {
      console.error('Error generating marketing insights:', error);
      return {
        analysis: 'Unable to generate marketing insights at this time.',
        confidence: 0,
        reasoning: ['Marketing analysis failed']
      };
    }
  }

  private async analyzeBrandVoice(projectId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('brand_voices')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        tone: data.tone,
        style: data.style,
        audience: data.audience,
        keyMessages: data.key_messages,
        terminology: data.terminology,
        avoidPhrases: data.avoid_phrases
      };
    } catch (error) {
      console.error('Error analyzing brand voice:', error);
      return null;
    }
  }

  private generateRecommendations(insights: any, intent: any): string[] {
    const recommendations = [];
    
    // Add intent-specific recommendations
    switch (intent.category) {
      case 'strategy':
        recommendations.push('Conduct competitive analysis');
        recommendations.push('Define clear target audience personas');
        recommendations.push('Establish measurable marketing objectives');
        break;
      case 'campaign':
        recommendations.push('A/B test campaign elements');
        recommendations.push('Implement conversion tracking');
        recommendations.push('Optimize for mobile experience');
        break;
      case 'content':
        recommendations.push('Create content calendar');
        recommendations.push('Develop content distribution strategy');
        recommendations.push('Measure content engagement metrics');
        break;
      default:
        recommendations.push('Monitor key performance indicators');
        recommendations.push('Test and iterate based on data');
        recommendations.push('Align with overall business objectives');
    }

    return recommendations;
  }

  private calculateMarketingConfidence(insights: any, sources: any[], intent: any): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on insights quality
    if (insights?.confidence) {
      confidence += insights.confidence * 0.3;
    }

    // Boost confidence based on available sources
    if (sources.length > 0) {
      confidence += Math.min(sources.length / 10, 0.2);
    }

    // Boost confidence based on intent specificity
    if (intent.confidence > 0.5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}
