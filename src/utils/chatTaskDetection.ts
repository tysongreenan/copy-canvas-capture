
export type AgentTaskType = 'general' | 'email' | 'summary' | 'research' | 'marketing' | 'content';

export function detectTaskType(message: string): AgentTaskType {
  // Convert to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();
  
  // Check for email patterns
  if (
    lowerMessage.includes('write an email') || 
    lowerMessage.includes('draft an email') ||
    lowerMessage.includes('email template') ||
    lowerMessage.includes('compose an email') ||
    (lowerMessage.includes('subject:') && (lowerMessage.includes('dear') || lowerMessage.includes('hi,')))
  ) {
    return 'email';
  }
  
  // Check for summary patterns
  if (
    lowerMessage.includes('summarize') ||
    lowerMessage.includes('tldr') ||
    lowerMessage.includes('summary of') ||
    lowerMessage.includes('key points') ||
    lowerMessage.startsWith('condense') ||
    lowerMessage.includes('in summary')
  ) {
    return 'summary';
  }
  
  // Check for research patterns
  if (
    lowerMessage.includes('research') ||
    lowerMessage.includes('analyze') ||
    lowerMessage.includes('investigate') ||
    lowerMessage.includes('explain') ||
    lowerMessage.includes('what is') ||
    lowerMessage.includes('how does') ||
    lowerMessage.includes('why does')
  ) {
    return 'research';
  }
  
  // Check for marketing patterns
  if (
    lowerMessage.includes('marketing') ||
    lowerMessage.includes('campaign') ||
    lowerMessage.includes('advertisement') ||
    lowerMessage.includes('promotion') ||
    lowerMessage.includes('brand') ||
    lowerMessage.includes('target audience') ||
    lowerMessage.includes('social media post') ||
    lowerMessage.includes('lead generation') ||
    lowerMessage.includes('sales funnel') ||
    lowerMessage.includes('advertising strategy') ||
    lowerMessage.includes('seo') ||
    lowerMessage.includes('conversion') ||
    lowerMessage.includes('growth')
  ) {
    return 'marketing';
  }
  
  // Check for content creation patterns
  if (
    lowerMessage.includes('write a') ||
    lowerMessage.includes('create content') ||
    lowerMessage.includes('blog post') ||
    lowerMessage.includes('article') ||
    lowerMessage.includes('story') ||
    lowerMessage.includes('generate text') ||
    lowerMessage.includes('content for')
  ) {
    return 'content';
  }
  
  // Default to general
  return 'general';
}

export function getPlaceholderText(taskType: AgentTaskType): string {
  switch (taskType) {
    case 'email':
      return 'Write a professional email to...';
    case 'summary':
      return 'Summarize the key points from...';
    case 'research':
      return 'Research and explain...';
    case 'marketing':
      return 'Help me create marketing content for...';
    case 'content':
      return 'Write content for...';
    case 'general':
    default:
      return 'Ask me anything...';
  }
}
