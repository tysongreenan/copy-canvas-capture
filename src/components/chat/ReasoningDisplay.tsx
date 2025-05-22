
import React, { useState } from "react";
import { AgentStep } from "@/services/AgentService";
import { Brain, Info, Sparkles } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

interface ReasoningDisplayProps {
  reasoning: AgentStep[];
  confidence?: number;
}

export function ReasoningDisplay({ reasoning, confidence }: ReasoningDisplayProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  // Helper to render confidence indicator
  const renderConfidenceIndicator = () => {
    if (confidence === undefined) return null;
    
    let color = "bg-yellow-500";
    if (confidence > 0.7) color = "bg-green-500";
    else if (confidence < 0.4) color = "bg-red-500";
    
    return (
      <div className="flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className={`h-2 w-2 rounded-full ${color}`}></div>
          <span>Confidence: {Math.round(confidence * 100)}%</span>
        </div>
      </div>
    );
  };

  // Helper function to render reasoning steps
  const renderReasoningStep = (step: AgentStep, index: number) => {
    const getStepIcon = () => {
      switch (step.type) {
        case 'tool_start':
          return <Info className="h-4 w-4 text-blue-500" />;
        case 'tool_result':
        case 'tool_error':
          return <Info className="h-4 w-4 text-yellow-500" />;
        case 'reasoning':
        case 'planning':
        case 'synthesis':
          return <Brain className="h-4 w-4 text-purple-500" />;
        case 'evaluation':
          return <Sparkles className="h-4 w-4 text-green-500" />;
        default:
          return <Info className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div key={index} className="flex items-start space-x-2 text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="mt-0.5">{getStepIcon()}</div>
        <div className="flex-1">
          <div className="font-medium">
            {step.toolName ? `${step.type} (${step.toolName})` : step.type}
          </div>
          <div className="text-gray-600 dark:text-gray-400">{step.content}</div>
        </div>
      </div>
    );
  };

  if (reasoning.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={showReasoning}
      onOpenChange={setShowReasoning}
      className="mt-2 border rounded-md p-2 border-white/10 bg-white/5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white/90">AI Reasoning Process</span>
          {renderConfidenceIndicator()}
        </div>
        
        <CollapsibleTrigger asChild>
          <button className="text-xs text-blue-400 hover:text-blue-300">
            {showReasoning ? "Hide Details" : "Show Details"}
          </button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-2 space-y-2">
        {reasoning.map(renderReasoningStep)}
      </CollapsibleContent>
    </Collapsible>
  );
}
