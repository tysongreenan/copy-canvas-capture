
export interface AgentContext {
  query: string;
  projectId: string;
  taskType: string;
  allowedCategories?: string[];
  userContext?: any;
  previousAgentResults?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  confidence: number;
  data: any;
  reasoning: string[];
  metadata?: Record<string, any>;
}

export abstract class BaseAgent {
  protected name: string;
  protected description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  abstract process(context: AgentContext): Promise<AgentResponse>;

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }
}
