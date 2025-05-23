
import React from 'react';
import { Brain } from 'lucide-react';
import { AgentTaskType } from '@/utils/chatTaskDetection';

interface ChatLoadingIndicatorProps {
  isLoading: boolean;
  taskType: AgentTaskType;
  isThinking?: boolean;
}

export function ChatLoadingIndicator({ isLoading, taskType, isThinking = false }: ChatLoadingIndicatorProps) {
  if (!isLoading) return null;
  
  const getLoadingText = () => {
    if (isThinking) {
      return "Thinking through this step by step...";
    }
    
    switch (taskType) {
      case 'email':
        return "Crafting an email response...";
      case 'summary':
        return "Creating a comprehensive summary...";
      case 'research':
        return "Researching this topic thoroughly...";
      case 'marketing':
        return "Generating marketing content...";
      case 'content':
        return "Creating high-quality content...";
      default:
        return "Processing your request...";
    }
  };
  
  return (
    <div className="flex items-center space-x-3 my-4 p-3 bg-slate-900/30 border border-blue-800/40 rounded-lg text-white/80">
      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-800/30 flex items-center justify-center">
        <Brain size={20} className="text-blue-400 animate-pulse" />
      </div>
      <div>
        <p className="font-medium">
          {getLoadingText()}
        </p>
        <div className="flex items-center mt-1 space-x-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "300ms" }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "600ms" }}></div>
        </div>
      </div>
    </div>
  );
}
