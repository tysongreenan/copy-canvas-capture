
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentService } from "@/services/ContentService";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Bookmark } from "lucide-react";

interface SaveButtonProps {
  content: ScrapedContent;
}

export function SaveButton({ content }: SaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to save illuminated content",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      await ContentService.saveContent(content);
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
      {saving ? "Saving..." : "Save Content"}
    </Button>
  );
}
