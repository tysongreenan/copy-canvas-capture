
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ContentProcessor } from '@/services/utils/ContentProcessor';
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface EmbeddingHealthDashboardProps {
  projectId: string;
}

export function EmbeddingHealthDashboard({ projectId }: EmbeddingHealthDashboardProps) {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const { toast } = useToast();

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const health = await ContentProcessor.checkEmbeddingHealth(projectId);
      setHealthData(health);
    } catch (error) {
      console.error('Error checking embedding health:', error);
      toast({
        title: "Error",
        description: "Failed to check embedding health",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processMissingEmbeddings = async () => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    try {
      const result = await ContentProcessor.processMissingEmbeddings(
        projectId,
        (processed, total) => {
          const progress = Math.round((processed / total) * 100);
          setProcessProgress(progress);
        }
      );

      toast({
        title: "Processing Complete",
        description: result.message,
      });

      // Refresh health data
      await checkHealth();
    } catch (error) {
      console.error('Error processing embeddings:', error);
      toast({
        title: "Error",
        description: "Failed to process missing embeddings",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [projectId]);

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
    if (score >= 30) return <Badge className="bg-orange-500">Fair</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={20} />
          Embedding Health Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin mr-2" size={20} />
            Checking health...
          </div>
        ) : healthData ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Content Pages:</span>
                  <Badge variant="outline">{healthData.contentCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Embeddings:</span>
                  <Badge variant="outline">{healthData.embeddingCount}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Health Score:</span>
                  {getHealthBadge(healthData.healthScore)}
                </div>
                <Progress value={healthData.healthScore} className="w-full" />
              </div>
            </div>

            {healthData.hasContent && !healthData.hasEmbeddings && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="text-yellow-600" size={16} />
                <span className="text-sm text-yellow-800">
                  Content found but no embeddings. Process embeddings to enable AI chat.
                </span>
              </div>
            )}

            {healthData.hasContent && healthData.hasEmbeddings && healthData.healthScore < 80 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="text-blue-600" size={16} />
                <span className="text-sm text-blue-800">
                  Some content may not have embeddings. Consider reprocessing.
                </span>
              </div>
            )}

            {healthData.hasContent && healthData.hasEmbeddings && healthData.healthScore >= 80 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600" size={16} />
                <span className="text-sm text-green-800">
                  Embeddings are healthy and ready for AI chat.
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={checkHealth} variant="outline" disabled={isLoading}>
                <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
                Refresh
              </Button>
              
              {healthData.hasContent && (
                <Button 
                  onClick={processMissingEmbeddings} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Processing... {processProgress}%
                    </>
                  ) : (
                    'Process Missing Embeddings'
                  )}
                </Button>
              )}
            </div>

            {isProcessing && (
              <Progress value={processProgress} className="w-full" />
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
