
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brush, 
  SlidersHorizontal, 
  MessageSquare,
  Users, 
  ListOrdered, 
  CheckCircle2, 
  AlertCircle,
  PenTool
} from "lucide-react";
import { BrandVoice } from "@/services/BrandingService";

interface BrandVoiceDashboardProps {
  brandVoice: Partial<BrandVoice>;
  onEditSection: (section: string) => void;
}

export function BrandVoiceDashboard({ brandVoice, onEditSection }: BrandVoiceDashboardProps) {
  // Calculate completion percentages
  const calculateCompletionScore = () => {
    let score = 0;
    const fields = [
      { name: "tone", weight: 25 },
      { name: "style", weight: 20 },
      { name: "audience", weight: 20 },
      { name: "language", weight: 10 },
      { name: "key_messages", weight: 15 },
      { name: "terminology", weight: 5 },
      { name: "avoid_phrases", weight: 5 },
    ];
    
    fields.forEach(field => {
      if (brandVoice[field.name]) {
        if (Array.isArray(brandVoice[field.name])) {
          if (brandVoice[field.name].length > 0) {
            score += field.weight;
          }
        } else if (typeof brandVoice[field.name] === 'object') {
          if (Object.keys(brandVoice[field.name]).length > 0) {
            score += field.weight;
          }
        } else if (brandVoice[field.name].toString().trim() !== "") {
          score += field.weight;
        }
      }
    });
    
    return score;
  };
  
  const completionScore = calculateCompletionScore();
  
  // Status indicator based on completion score
  const getStatusIndicator = (score: number) => {
    if (score >= 80) return { color: "text-green-600", label: "Complete", icon: CheckCircle2 };
    if (score >= 40) return { color: "text-amber-600", label: "In Progress", icon: PenTool };
    return { color: "text-red-600", label: "Needs Setup", icon: AlertCircle };
  };
  
  const status = getStatusIndicator(completionScore);
  const StatusIcon = status.icon;

  return (
    <div className="space-y-8">
      <Card className="border-indigo-100 bg-indigo-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                <Brush className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Brand Voice Profile</h2>
                <div className="flex items-center mt-1">
                  <StatusIcon className={`h-4 w-4 ${status.color} mr-1`} />
                  <span className={`text-sm ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">Completion</span>
                <Badge variant="outline" className={`${
                  completionScore >= 80 ? "bg-green-100 text-green-800" :
                  completionScore >= 40 ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {completionScore}%
                </Badge>
              </div>
              <Progress 
                value={completionScore} 
                className="h-2 w-full md:w-48" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone and Style Card */}
        <Card className="hover:border-indigo-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tone & Style</CardTitle>
                  <CardDescription>How your brand sounds to customers</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onEditSection("tone")}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Brand Tone</h4>
                <p className="text-sm">
                  {brandVoice.tone || <span className="text-gray-400 italic">Not specified</span>}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Writing Style</h4>
                <p className="text-sm">
                  {brandVoice.style || <span className="text-gray-400 italic">Not specified</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Audience Card */}
        <Card className="hover:border-indigo-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Target Audience</CardTitle>
                  <CardDescription>Who you're creating content for</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onEditSection("audience")}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Primary Audience</h4>
                <p className="text-sm">
                  {brandVoice.audience || <span className="text-gray-400 italic">Not specified</span>}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Language Preference</h4>
                <p className="text-sm">
                  {brandVoice.language || <span className="text-gray-400 italic">Not specified</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Key Messages Card */}
        <Card className="hover:border-indigo-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Key Messages</CardTitle>
                  <CardDescription>Important points to emphasize</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onEditSection("content")}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              {Array.isArray(brandVoice.key_messages) && brandVoice.key_messages.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {brandVoice.key_messages.slice(0, 3).map((message, i) => (
                    <li key={i}>{message}</li>
                  ))}
                  {brandVoice.key_messages.length > 3 && (
                    <li className="text-indigo-600 font-medium">
                      +{brandVoice.key_messages.length - 3} more messages
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No key messages defined</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Terminology Card */}
        <Card className="hover:border-indigo-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <ListOrdered className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Brand Terminology</CardTitle>
                  <CardDescription>Specific terms and phrases to use</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onEditSection("language")}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              {brandVoice.terminology && Object.keys(brandVoice.terminology).length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(brandVoice.terminology).slice(0, 4).map(([term, definition], i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">{term}:</span> {definition}
                    </div>
                  ))}
                  {Object.keys(brandVoice.terminology).length > 4 && (
                    <div className="col-span-2 text-center text-indigo-600 font-medium text-sm">
                      +{Object.keys(brandVoice.terminology).length - 4} more terms
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No terminology defined</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
