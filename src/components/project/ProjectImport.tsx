
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrapeForm } from "@/components/ScrapeForm";
import { FileUpload } from "@/components/chat/FileUpload";
import { Globe, Upload, FileText, RefreshCw } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { RescanTab } from "@/components/project/RescanTab";
import { ContentService } from "@/services/ContentService";

export function ProjectImport() {
  const [activeTab, setActiveTab] = useState<string>("url");
  const [textContent, setTextContent] = useState<string>("");
  const { toast } = useToast();
  const { project } = useProject();
  
  const handleImportSuccess = () => {
    toast({
      title: "Import successful",
      description: "Your content has been imported and processed",
    });
  };

  const handleImportText = async () => {
    if (!textContent.trim() || !project?.id) {
      toast({
        title: "Error",
        description: "Please enter some text content and ensure you're in a project",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a content object for the pasted text
      const textContentObj = {
        url: `text://${new Date().getTime()}`,
        title: `Pasted Text ${new Date().toLocaleDateString()}`,
        headings: [],
        paragraphs: textContent.split(/\n+/).filter(p => p.trim().length > 0),
        links: [],
        listItems: [],
        metaDescription: null,
        metaKeywords: null,
        projectId: project.id
      };

      // Save to database
      await ContentService.saveContent(textContentObj);

      toast({
        title: "Text imported",
        description: "Your text has been added to the project content",
      });

      // Clear the textarea
      setTextContent("");
    } catch (error) {
      console.error("Error importing text:", error);
      toast({
        title: "Import failed",
        description: "There was a problem importing your text",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Import Content</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add content to your project</CardTitle>
          <CardDescription>
            Import content from websites or upload files to enhance your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Website URL</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Paste Text</span>
              </TabsTrigger>
              <TabsTrigger value="rescan" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Rescan</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-4">Import from URL</h3>
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-4">
                  Enter a website URL to scrape its content and add it to your project
                </p>
                <ScrapeForm 
                  onResult={() => {}} 
                  projectId={project?.id}
                  inProjectView={true}
                  onCrawlComplete={handleImportSuccess}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-4">Upload Files</h3>
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-4">
                  Upload PDF, Word, or Markdown files to add their content to your project
                </p>
                
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="file-upload">Select files to upload</Label>
                    <div className="flex gap-2">
                      <FileUpload 
                        projectId={project?.id || ''} 
                        onSuccess={handleImportSuccess}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Supported formats: PDF, DOCX, MD (Max size: 10MB)</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="p-4 border rounded-md mt-4">
              <h3 className="text-lg font-medium mb-4">Paste Text</h3>
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-4">
                  Paste text content directly to add it to your project
                </p>
                
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="text-content">Text content</Label>
                    <textarea
                      id="text-content"
                      className="min-h-[200px] p-3 rounded-md border"
                      placeholder="Paste your text content here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full md:w-auto"
                    onClick={handleImportText}
                  >
                    Import Text
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rescan" className="mt-4">
              <RescanTab project={project || {}} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
