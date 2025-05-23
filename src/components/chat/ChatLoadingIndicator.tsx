
import React from "react";
import { AgentTaskType } from "@/utils/chatTaskDetection";
import { Loader2 } from "lucide-react";

interface ChatLoadingIndicatorProps {
  isLoading: boolean;
  taskType: AgentTaskType;
  isThinking?: boolean;
}

export function ChatLoadingIndicator({ 
  isLoading, 
  taskType,
  isThinking = false
}: ChatLoadingIndicatorProps) {
  if (!isLoading) return null;

  let loadingMessage = "Thinking...";

  if (isThinking) {
    loadingMessage = "Thinking deeply about this...";
  } else if (taskType === 'email') {
    loadingMessage = "Crafting email...";
  } else if (taskType === 'summary') {
    loadingMessage = "Creating summary...";
  } else if (taskType === 'research') {
    loadingMessage = "Researching...";
  } else if (taskType === 'marketing') {
    loadingMessage = "Creating marketing content...";
  } else if (taskType === 'content') {
    loadingMessage = "Creating content...";
  }

  return (
    <div className="flex items-center gap-2 text-white/60 animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{loadingMessage}</span>
    </div>
  );
}
