
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Brain, Search, FileText, CheckCircle } from "lucide-react";
import { AgentStep } from "@/services/AgentService";
import { ChatEvaluation } from "@/hooks/use-chat-messaging";
import { useChat } from "@/context/ChatContext";

interface ReasoningDisplayProps {
  reasoning: AgentStep[];
  confidence?: number;
  evaluation?: ChatEvaluation;
}

export function ReasoningDisplay({ reasoning, confidence, evaluation }: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { lastSources } = useChat();

  if (!reasoning || reasoning.length === 0) {
    return null;
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'retrieval':
        return <FileText className="h-4 w-4" />;
      case 'reasoning':
        return <Brain className="h-4 w-4" />;
      case 'evaluation':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'search':
        return 'text-blue-600';
      case 'retrieval':
        return 'text-green-600';
      case 'reasoning':
        return 'text-purple-600';
      case 'evaluation':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="mt-4 border-l-4 border-l-purple-500 bg-purple-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            AI Reasoning Process
            {confidence && (
              <Badge variant="secondary" className="ml-2">
                {(confidence * 100).toFixed(0)}% confident
              </Badge>
            )}
            {evaluation && (
              <Badge variant="outline" className="ml-2">
                {evaluation.iterations} iteration{evaluation.iterations !== 1 ? 's' : ''} • {evaluation.quality.toFixed(0)}% quality
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {reasoning.map((step, index) => (
              <div key={index} className="flex gap-3 text-sm">
                <div className={`flex-shrink-0 mt-0.5 ${getStepColor(step.type)}`}>
                  {getStepIcon(step.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize mb-1">
                    {step.type.replace('_', ' ')}
                  </div>
                  <div className="text-gray-600">
                    {step.content}
                  </div>
                  {step.toolName && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {step.toolName}
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {/* Display sources with quality information */}
            {lastSources && lastSources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Retrieved Sources ({lastSources.length})
                </div>
                <div className="space-y-2">
                  {lastSources.map((source, index) => (
                    <div key={index} className="p-2 bg-white rounded border text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">
                          {source.source_info || source.metadata?.source || `Source ${index + 1}`}
                        </span>
                        <div className="flex gap-1">
                          {source.source_type && (
                            <Badge variant="outline" className="text-xs">
                              {source.source_type}
                            </Badge>
                          )}
                          {source.similarity && (
                            <Badge variant="secondary" className="text-xs">
                              {(source.similarity * 100).toFixed(0)}% match
                            </Badge>
                          )}
                          {source.quality_score && (
                            <Badge 
                              variant={source.quality_score >= 80 ? "default" : source.quality_score >= 60 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {source.quality_score.toFixed(0)}% quality
                            </Badge>
                          )}
                          {source.weighted_score && (
                            <Badge variant="outline" className="text-xs">
                              {(source.weighted_score * 100).toFixed(0)}% score
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-600 line-clamp-2">
                        {source.content.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display evaluation history if available */}
            {evaluation && evaluation.evaluationHistory && evaluation.evaluationHistory.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Quality Evaluation History
                </div>
                <div className="space-y-2">
                  {evaluation.evaluationHistory.map((eval, index) => (
                    <div key={index} className="p-2 bg-white rounded border text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Iteration {index + 1}</span>
                        <Badge variant={eval.score >= 90 ? "default" : "secondary"}>
                          {eval.score.toFixed(0)}% quality
                        </Badge>
                      </div>
                      <div className="text-gray-600">{eval.feedback}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
