import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Youtube, Search, Users } from "lucide-react";

interface DataIngestionSettings {
  youtubeVideos: string[];
  researchKeywords: string[];
  competitors: string[];
}

interface ProjectWizardDataIngestionProps {
  settings: DataIngestionSettings;
  updateSettings: (settings: Partial<DataIngestionSettings>) => void;
}

export function ProjectWizardDataIngestion({ settings, updateSettings }: ProjectWizardDataIngestionProps) {
  const [youtubeInput, setYoutubeInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  const handleAddYoutubeVideo = () => {
    if (youtubeInput.trim()) {
      // Basic YouTube URL validation
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (youtubeUrlPattern.test(youtubeInput.trim())) {
        updateSettings({
          youtubeVideos: [...settings.youtubeVideos, youtubeInput.trim()]
        });
        setYoutubeInput("");
      } else {
        // In production, you'd show a toast error here
        console.error("Invalid YouTube URL");
      }
    }
  };

  const handleRemoveYoutubeVideo = (index: number) => {
    updateSettings({
      youtubeVideos: settings.youtubeVideos.filter((_, i) => i !== index)
    });
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      updateSettings({
        researchKeywords: [...settings.researchKeywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    updateSettings({
      researchKeywords: settings.researchKeywords.filter((_, i) => i !== index)
    });
  };

  const handleAddCompetitor = () => {
    if (competitorInput.trim()) {
      updateSettings({
        competitors: [...settings.competitors, competitorInput.trim()]
      });
      setCompetitorInput("");
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    updateSettings({
      competitors: settings.competitors.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Data Ingestion</h2>
        <p className="text-gray-500 mb-6">
          Add additional data sources to build your knowledge base. These will be processed and embedded for AI-powered insights.
        </p>
      </div>

      {/* YouTube Videos */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="h-5 w-5 text-red-600" />
              <Label>YouTube Videos</Label>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Add YouTube video URLs to extract transcripts and insights from video content.
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddYoutubeVideo()}
              />
              <Button onClick={handleAddYoutubeVideo} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {settings.youtubeVideos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {settings.youtubeVideos.map((video, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    <span className="text-xs truncate max-w-[200px]">{video}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveYoutubeVideo(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Research Keywords */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-5 w-5 text-blue-600" />
              <Label>Research Keywords</Label>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Add keywords or topics for deep research. The AI will search the web and compile comprehensive reports.
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g., email marketing best practices"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
              />
              <Button onClick={handleAddKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {settings.researchKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {settings.researchKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {keyword}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveKeyword(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <Label>Competitors</Label>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Add competitor websites or brand names to analyze their strategies and positioning.
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g., competitor.com or Brand Name"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCompetitor()}
              />
              <Button onClick={handleAddCompetitor} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {settings.competitors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {settings.competitors.map((competitor, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {competitor}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveCompetitor(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 