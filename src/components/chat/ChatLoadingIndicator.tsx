
import React from "react";
import { Loader2 } from "lucide-react";
import { AgentTaskType } from "@/utils/chatTaskDetection";
import { getLoadingMessage } from "@/utils/chatTaskDetection";

interface ChatLoadingIndicatorProps {
  isLoading: boolean;
  taskType: AgentTaskType;
}

export function ChatLoadingIndicator({ isLoading, taskType }: ChatLoadingIndicatorProps) {
  if (!isLoading) return null;
  
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      <p>{getLoadingMessage(taskType)}</p>
    </div>
  );
}
