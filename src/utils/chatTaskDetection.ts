
export type AgentTaskType = 'general' | 'email' | 'marketing' | 'research' | 'summary' | 'content';

/**
 * Detects the most likely task type based on message content
 */
export const detectTaskType = (message: string): AgentTaskType => {
  const lowerMessage = message.toLowerCase();
  
  // Marketing and content task detection
  if (lowerMessage.includes('seo') || 
      lowerMessage.includes('eeat') || 
      lowerMessage.includes('e-e-a-t') ||
      lowerMessage.includes('marketing strategy') ||
      lowerMessage.includes('content calendar') ||
      lowerMessage.includes('blog post') ||
      lowerMessage.includes('content strategy')) {
    return 'marketing';
  }
  
  // Content creation detection
  if (lowerMessage.includes('create content') ||
      lowerMessage.includes('article') ||
      lowerMessage.includes('content creation') ||
      lowerMessage.includes('write a post')) {
    return 'content';
  }
  
  // Email task detection
  if (lowerMessage.includes('email') || 
      lowerMessage.includes('subject line') || 
      lowerMessage.includes('newsletter')) {
    return 'email';
  }
  
  // Summary task detection
  if (lowerMessage.includes('summarize') || 
      lowerMessage.includes('summary') || 
      lowerMessage.startsWith('tldr')) {
    return 'summary';
  }
  
  // Research task detection
  if (lowerMessage.includes('research') || 
      lowerMessage.includes('find information') ||
      lowerMessage.includes('tell me about')) {
    return 'research';
  }
  
  return 'general';
};

/**
 * Get appropriate placeholder text based on task type
 */
export const getPlaceholderText = (taskType: AgentTaskType): string => {
  switch(taskType) {
    case 'email':
      return "Describe the email you want to create...";
    case 'marketing':
      return "Ask about marketing strategies, content ideas, or SEO best practices...";
    case 'research':
      return "What would you like me to research for you?";
    case 'summary':
      return "What would you like me to summarize?";
    default:
      return "Type your message here...";
  }
};

/**
 * Get loading message based on task type
 */
export const getLoadingMessage = (taskType: AgentTaskType): string => {
  switch(taskType) {
    case 'email':
      return "Crafting email content...";
    case 'marketing':
      return "Analyzing marketing strategies...";
    case 'research':
      return "Researching information...";
    case 'summary':
      return "Creating summary...";
    default:
      return "Thinking...";
  }
};
