import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast";
import { ContentService } from "@/services/ContentService";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { useAuth } from "@/context/AuthContext";

interface SaveProjectButtonProps {
  title: string;
  startUrl: string;
  contents: ScrapedContent[];
}

export function SaveProjectButton({ 
  title,
  startUrl,
  contents 
}: SaveProjectButtonProps) {
  const [saving, setSaving] = useState(false);
  const [processingEmbeddings, setProcessingEmbeddings] = useState(false);
  const [withEmbeddings, setWithEmbeddings] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to save this project",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Save the project first
      const savedProject = await ContentService.saveProject(title, startUrl, contents);
      
      if (!savedProject) {
        throw new Error("Failed to save project");
      }
      
      toast({
        title: "Project saved",
        description: `Project with ${contents.length} pages saved successfully`
      });
      
      // If user opted to process for AI chat, generate embeddings
      if (withEmbeddings) {
        setProcessingEmbeddings(true);
        
        toast({
          title: "Processing content",
          description: "Preparing content for AI chat..."
        });
        
        // Import dynamically to avoid circular dependencies
        const { EmbeddingService } = await import("@/services/EmbeddingService");
        
        // Process all pages
        const success = await EmbeddingService.processProject(savedProject.id, contents);
        
        if (success) {
          toast({
            title: "Processing complete",
            description: "Content is ready for AI chat"
          });
        } else {
          toast({
            title: "Processing incomplete",
            description: "Some content could not be processed for AI chat",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setProcessingEmbeddings(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          Save Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Save this project to your account to access it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="project-title" className="text-right">
              Project Name
            </Label>
            <Input
              id="project-title"
              value={title}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="page-count" className="text-right">
              Pages
            </Label>
            <Input
              id="page-count"
              value={contents.length}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ai-chat" 
              checked={withEmbeddings}
              onCheckedChange={(checked) => setWithEmbeddings(checked as boolean)}
            />
            <Label htmlFor="ai-chat">Process content for AI chat</Label>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={saving || processingEmbeddings}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : processingEmbeddings ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <>Save</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
