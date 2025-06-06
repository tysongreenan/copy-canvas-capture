import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RAGSettingsService } from '@/services/RAGSettingsService';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceRAGSettingsProps {
  projectId: string;
}

export function WorkspaceRAGSettings({ projectId }: WorkspaceRAGSettingsProps) {
  const [similarity, setSimilarity] = useState(0.25);
  const [quality, setQuality] = useState(0.6);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const data = await RAGSettingsService.getSettings(projectId);
      if (data) {
        setSimilarity(data.similarity_threshold);
        setQuality(data.min_quality_score);
      }
      setLoading(false);
    };
    load();
  }, [projectId]);

  const handleSave = async () => {
    const result = await RAGSettingsService.saveSettings(projectId, {
      similarity_threshold: similarity,
      min_quality_score: quality
    });
    if (result) {
      toast({ title: 'Settings Saved', description: 'Workspace RAG settings updated' });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>RAG Search Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="similarity">Similarity Threshold</Label>
          <Input
            id="similarity"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={similarity}
            onChange={(e) => setSimilarity(parseFloat(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="quality">Min Quality Score</Label>
          <Input
            id="quality"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="mt-1"
          />
        </div>
        <Button onClick={handleSave} disabled={loading}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
