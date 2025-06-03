
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';

export class QualityControlAgent extends BaseAgent {
  constructor() {
    super('Quality Control', 'Marketing ethics and best practices validation');
  }

  async process(context: AgentContext): Promise<AgentResponse> {
    const reasoning: string[] = [];
    reasoning.push('Initiating quality control and marketing ethics validation');

    try {
      // Get marketing insights from previous agent
      const marketingData = context.previousAgentResults?.marketingExpert?.data;
      const insights = marketingData?.insights?.analysis || '';
      const recommendations = marketingData?.recommendations || [];

      reasoning.push('Analyzing marketing recommendations for quality and ethics');

      // Quality assessment
      const qualityScore = this.assessContentQuality(insights);
      reasoning.push(`Content quality score: ${Math.round(qualityScore * 100)}%`);

      // Ethics validation
      const ethicsValidation = this.validateEthics(insights, recommendations);
      reasoning.push(`Ethics validation: ${ethicsValidation.passed ? 'Passed' : 'Issues detected'}`);

      // Best practices check
      const bestPracticesCheck = this.checkBestPractices(insights, context.query);
      reasoning.push(`Best practices compliance: ${bestPracticesCheck.score}%`);

      // Regulatory compliance (basic check)
      const complianceCheck = this.checkCompliance(insights);
      reasoning.push(`Regulatory compliance: ${complianceCheck.status}`);

      // Generate quality improvements
      const improvements = this.generateImprovements(insights, ethicsValidation, bestPracticesCheck);
      
      const overallScore = (qualityScore + ethicsValidation.score + (bestPracticesCheck.score / 100)) / 3;
      reasoning.push(`Overall quality assessment: ${Math.round(overallScore * 100)}%`);

      return {
        success: true,
        confidence: overallScore,
        data: {
          qualityScore,
          ethicsValidation,
          bestPracticesCheck,
          complianceCheck,
          improvements,
          approved: overallScore >= 0.7,
          originalInsights: insights
        },
        reasoning,
        metadata: {
          qualityThreshold: 0.7,
          ethicsPassed: ethicsValidation.passed,
          needsImprovement: overallScore < 0.7
        }
      };
    } catch (error) {
      reasoning.push(`Error during quality control: ${error.message}`);
      return {
        success: false,
        confidence: 0,
        data: null,
        reasoning
      };
    }
  }

  private assessContentQuality(content: string): number {
    if (!content || content.length < 50) return 0.1;

    let score = 0.5; // Base score

    // Length and depth
    if (content.length > 500) score += 0.1;
    if (content.length > 1000) score += 0.1;

    // Structure indicators
    const hasHeadings = /#{1,3}\s/.test(content) || content.includes('\n\n');
    if (hasHeadings) score += 0.1;

    // Actionable content
    const actionWords = ['recommend', 'suggest', 'implement', 'consider', 'optimize', 'improve'];
    const actionableCount = actionWords.filter(word => content.toLowerCase().includes(word)).length;
    score += Math.min(actionableCount * 0.05, 0.2);

    // Specificity
    const specificTerms = ['kpi', 'roi', 'conversion', 'targeting', 'segmentation', 'analytics'];
    const specificityCount = specificTerms.filter(term => content.toLowerCase().includes(term)).length;
    score += Math.min(specificityCount * 0.03, 0.15);

    return Math.min(score, 1.0);
  }

  private validateEthics(content: string, recommendations: string[]): { passed: boolean; score: number; issues: string[] } {
    const issues: string[] = [];
    const contentLower = content.toLowerCase();
    const allRecommendations = recommendations.join(' ').toLowerCase();

    // Check for misleading practices
    const misleadingTerms = ['guaranteed results', 'instant success', 'get rich quick', 'no risk'];
    misleadingTerms.forEach(term => {
      if (contentLower.includes(term) || allRecommendations.includes(term)) {
        issues.push(`Potentially misleading claim: "${term}"`);
      }
    });

    // Check for spam indicators
    const spamIndicators = ['click here now', 'limited time only', 'act now', 'urgent'];
    spamIndicators.forEach(indicator => {
      if (contentLower.includes(indicator)) {
        issues.push(`Spam-like language detected: "${indicator}"`);
      }
    });

    // Check for aggressive sales tactics
    const aggressiveTactics = ['buy now or lose forever', 'last chance', 'dont miss out'];
    aggressiveTactics.forEach(tactic => {
      if (contentLower.includes(tactic)) {
        issues.push(`Aggressive sales tactic: "${tactic}"`);
      }
    });

    // Check for privacy considerations
    if (contentLower.includes('collect personal data') && !contentLower.includes('privacy policy')) {
      issues.push('Data collection mentioned without privacy policy reference');
    }

    const score = Math.max(0, 1 - (issues.length * 0.2));
    return {
      passed: issues.length === 0,
      score,
      issues
    };
  }

  private checkBestPractices(content: string, query: string): { score: number; recommendations: string[] } {
    const recommendations: string[] = [];
    let score = 70; // Base score

    const contentLower = content.toLowerCase();

    // Check for data-driven approach
    const dataTerms = ['analytics', 'metrics', 'data', 'measurement', 'tracking'];
    const hasDataFocus = dataTerms.some(term => contentLower.includes(term));
    if (hasDataFocus) {
      score += 10;
    } else {
      recommendations.push('Include data-driven measurement strategies');
    }

    // Check for audience consideration
    const audienceTerms = ['audience', 'target', 'persona', 'customer', 'user'];
    const hasAudienceFocus = audienceTerms.some(term => contentLower.includes(term));
    if (hasAudienceFocus) {
      score += 10;
    } else {
      recommendations.push('Consider target audience in recommendations');
    }

    // Check for testing methodology
    const testingTerms = ['test', 'experiment', 'a/b', 'optimize', 'iterate'];
    const hasTestingFocus = testingTerms.some(term => contentLower.includes(term));
    if (hasTestingFocus) {
      score += 10;
    } else {
      recommendations.push('Include testing and optimization strategies');
    }

    // Check for multi-channel approach
    const channelTerms = ['email', 'social', 'content', 'seo', 'paid', 'organic'];
    const channelCount = channelTerms.filter(term => contentLower.includes(term)).length;
    if (channelCount >= 2) {
      score += 10;
    } else {
      recommendations.push('Consider multi-channel marketing approach');
    }

    return {
      score: Math.min(score, 100),
      recommendations
    };
  }

  private checkCompliance(content: string): { status: string; warnings: string[] } {
    const warnings: string[] = [];
    const contentLower = content.toLowerCase();

    // GDPR considerations
    if (contentLower.includes('personal data') || contentLower.includes('email list')) {
      if (!contentLower.includes('consent') && !contentLower.includes('permission')) {
        warnings.push('Consider GDPR compliance for data collection');
      }
    }

    // CAN-SPAM considerations
    if (contentLower.includes('email marketing')) {
      if (!contentLower.includes('unsubscribe') && !contentLower.includes('opt-out')) {
        warnings.push('Include unsubscribe options for email marketing');
      }
    }

    // Accessibility considerations
    if (contentLower.includes('website') || contentLower.includes('landing page')) {
      if (!contentLower.includes('accessible') && !contentLower.includes('accessibility')) {
        warnings.push('Consider accessibility standards for web content');
      }
    }

    return {
      status: warnings.length === 0 ? 'Compliant' : 'Needs Review',
      warnings
    };
  }

  private generateImprovements(content: string, ethics: any, bestPractices: any): string[] {
    const improvements: string[] = [];

    // Add ethics improvements
    if (!ethics.passed) {
      improvements.push(...ethics.issues.map((issue: string) => `Ethics: ${issue}`));
    }

    // Add best practice improvements
    if (bestPractices.score < 80) {
      improvements.push(...bestPractices.recommendations.map((rec: string) => `Best Practice: ${rec}`));
    }

    // General quality improvements
    if (content.length < 300) {
      improvements.push('Provide more detailed and comprehensive analysis');
    }

    if (!content.includes('ROI') && !content.includes('return on investment')) {
      improvements.push('Include ROI considerations in recommendations');
    }

    return improvements;
  }
}
