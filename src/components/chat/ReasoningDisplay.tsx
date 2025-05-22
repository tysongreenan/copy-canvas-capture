
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AgentStep } from '@/services/AgentService';
import { Brain, ArrowUpRight, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';

interface ReasoningDisplayProps {
  reasoning: AgentStep[];
  confidence?: number;
  evaluation?: {
    iterations: number;
    quality: number;
    evaluationHistory: Array<{
      score: number;
      feedback: string;
    }>;
  };
}

export function ReasoningDisplay({ reasoning, confidence, evaluation }: ReasoningDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  if (!reasoning.length) return null;

  const getConfidenceColor = (score?: number) => {
    if (!score && score !== 0) return "text-gray-400";
    if (score >= 0.9) return "text-green-500";
    if (score >= 0.7) return "text-yellow-500";
    return "text-red-500";
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const confidencePercent = confidence !== undefined ? Math.round(confidence * 100) : undefined;
  
  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg text-sm mt-4">
      <div className="p-3 flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-blue-400" />
          <span className="font-medium text-white/80">AI Reasoning Process</span>
          
          {confidencePercent !== undefined && (
            <span className={`ml-2 ${getConfidenceColor(confidence)}`}>
              {confidencePercent}% confidence
            </span>
          )}
          
          {evaluation && (
            <span className="ml-2 text-white/60">
              • {evaluation.iterations} {evaluation.iterations === 1 ? 'iteration' : 'iterations'} 
              • <span className={getQualityColor(evaluation.quality)}>
                {Math.round(evaluation.quality)}% quality
              </span>
            </span>
          )}
        </div>
        <div>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 text-white/70 space-y-3">
          {reasoning.map((step, index) => (
            <div key={index} className="bg-white/5 p-3 rounded-md">
              <div className="font-medium text-xs uppercase tracking-wider text-blue-300 mb-1">
                {step.type || "Analysis"} Step {index + 1}
              </div>
              <div className="whitespace-pre-wrap">{step.content}</div>
              {step.toolName && (
                <div className="mt-2 text-xs flex items-center gap-1 text-gray-400">
                  <ArrowUpRight size={12} /> 
                  Used tool: {step.toolName}
                </div>
              )}
            </div>
          ))}
          
          {evaluation && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10"
                onClick={() => setShowEvaluation(!showEvaluation)}
              >
                <BarChart2 size={16} />
                {showEvaluation ? "Hide Evaluation Details" : "Show Evaluation Details"}
              </Button>
              
              {showEvaluation && (
                <div className="mt-3 space-y-3">
                  {evaluation.evaluationHistory.map((evalItem, index) => (
                    <div key={index} className="bg-black/30 p-3 rounded-md border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-xs uppercase tracking-wider text-blue-300">
                          Evaluation {index + 1}
                        </div>
                        <div className={`text-sm font-medium ${getQualityColor(evalItem.score)}`}>
                          Score: {Math.round(evalItem.score)}%
                        </div>
                      </div>
                      <div className="text-xs whitespace-pre-wrap text-white/70">
                        {evalItem.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
