
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentService } from "@/services/ContentService";
import type { ScrapedContent } from "@/services/ScraperService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Bookmark, Save, Check } from "lucide-react";

interface SaveButtonProps {
  content: ScrapedContent;
}

export function SaveButton({ content }: SaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
      
      toast({
        title: "Content saved",
        description: "This content will remain saved until you delete it",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving the content",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSave} 
      disabled={saving || !user || saved}
      variant={saved ? "outline" : "default"}
      className="gap-2"
    >
      {saved ? (
        <>
          <Check className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Content"}
        </>
      )}
    </Button>
  );
}
