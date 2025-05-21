
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RescanService, RescanResults } from "@/services/RescanService";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCcw, CheckCircle, AlertCircle, PlusCircle } from "lucide-react";

interface RescanTabProps {
  project: any;
}

export function RescanTab({ project }: RescanTabProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RescanResults | null>(null);
  const [generateEmbeddings, setGenerateEmbeddings] = useState(true);
  const [onlyProcessNew, setOnlyProcessNew] = useState(true);
  const [maxPages, setMaxPages] = useState(50);
  
  const handleRescan = async () => {
    if (!project?.id) {
      toast({
        title: "Error",
        description: "Project ID is required for rescanning",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const rescanResults = await RescanService.rescanProject(project.id, {
        projectId: project.id,
        generateEmbeddings,
        onlyProcessNewContent: onlyProcessNew,
        maxPages
      });
      
      if (rescanResults) {
        setResults(rescanResults);
        
        const { newContent, changedContent, unchangedContent } = rescanResults.comparison;
        
        toast({
          title: "Rescan complete",
          description: `Found ${newContent.length} new pages and ${changedContent.length} changed pages`,
        });
        
        // If we found new or changed content, notify that the content is saved
        if (newContent.length > 0 || (changedContent.length > 0 && !onlyProcessNew)) {
          toast({
            title: "Content saved",
            description: `Content has been saved to the database and is now visible in the Content tab`,
          });
        }
      }
    } catch (error) {
      console.error("Error rescanning:", error);
      toast({
        title: "Rescan error",
        description: "An error occurred while rescanning the project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md mt-4">
      <h3 className="text-lg font-medium mb-4">Rescan Project for Changes</h3>
      <p className="text-gray-500 text-sm mb-4">
        Rescan the website to check for new or updated content and generate fresh embeddings
      </p>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="embedding-toggle"
            checked={generateEmbeddings}
            onCheckedChange={setGenerateEmbeddings}
          />
          <Label htmlFor="embedding-toggle" className="flex items-center cursor-pointer">
            Generate AI embeddings for new/changed content
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="only-new-toggle"
            checked={onlyProcessNew}
            onCheckedChange={setOnlyProcessNew}
          />
          <Label htmlFor="only-new-toggle" className="flex items-center cursor-pointer">
            Only process new/changed content (recommended)
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="max-pages" className="min-w-[120px]">Maximum pages:</Label>
          <Input
            id="max-pages"
            type="number"
            min="1"
            max="100"
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-500">
            (Higher values may take longer)
          </span>
        </div>
      </div>
      
      <Button 
        onClick={handleRescan}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Rescanning...</span>
          </>
        ) : (
          <>
            <RefreshCcw className="h-4 w-4" />
            <span>Start Rescan</span>
          </>
        )}
      </Button>
      
      {results && !loading && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium">Rescan Results</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-green-500" />
                  <h5 className="font-medium">New Content</h5>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-lg">
                    {results.comparison.newContent.length}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    New pages discovered during this scan
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h5 className="font-medium">Changed Content</h5>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-lg">
                    {results.comparison.changedContent.length}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    Existing pages with content updates
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <h5 className="font-medium">Unchanged Content</h5>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-lg">
                    {results.comparison.unchangedContent.length}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    Pages with no content changes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {results.comparison.removedUrls.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium mb-2">Removed Pages</h5>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {results.comparison.removedUrls.map((url, index) => (
                  <li key={index} className="truncate">{url}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
