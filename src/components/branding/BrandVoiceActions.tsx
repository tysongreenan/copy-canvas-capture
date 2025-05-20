
import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";

interface BrandVoiceActionsProps {
  onGenerateAI: () => Promise<void>;
  onSave: () => void;
  generating: boolean;
  saving: boolean;
}

export function BrandVoiceActions({ 
  onGenerateAI, 
  onSave, 
  generating, 
  saving 
}: BrandVoiceActionsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onGenerateAI} 
        variant="outline" 
        className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
        disabled={generating || saving}
      >
        {generating ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            Analyzing...
          </div>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Analysis
          </>
        )}
      </Button>
      
      <Button 
        onClick={onSave} 
        disabled={saving}
      >
        {saving ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </div>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
