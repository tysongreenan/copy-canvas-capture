
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentService } from "@/services/ContentService";
import type { ScrapedContent } from "@/services/ScraperService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Bookmark } from "lucide-react";

interface SaveProjectButtonProps {
  title: string;
  startUrl: string;
  contents: ScrapedContent[];
}

export function SaveProjectButton({ title, startUrl, contents }: SaveProjectButtonProps) {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to save project content",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      await ContentService.saveProject(title, startUrl, contents);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSave} 
      disabled={saving || !user}
      className="gap-2"
    >
      <Bookmark className="h-4 w-4" />
      {saving ? "Saving..." : "Save Project"}
    </Button>
  );
}
