
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { BrandingService, BrandVoice } from "@/services/BrandingService";
import { ContentService } from "@/services/ContentService";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Brush, Globe } from "lucide-react";
import { BrandVoiceForm } from "@/components/branding/BrandVoiceForm";
import { BrandVoiceActions } from "@/components/branding/BrandVoiceActions";

const BrandingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const form = useForm<Partial<BrandVoice>>({
    defaultValues: {
      project_id: id,
      tone: "",
      style: "",
      language: "",
      audience: "",
      key_messages: [],
      terminology: {},
      avoid_phrases: []
    }
  });

  useEffect(() => {
    if (!user || !id) return;

    const fetchProjectAndBrandVoice = async () => {
      setLoading(true);
      try {
        // Get project details
        const projectData = await ContentService.getProjectById(id);
        setProject(projectData);
        
        // Get brand voice settings
        const brandVoice = await BrandingService.getBrandVoice(id);
        if (brandVoice) {
          // Populate form with existing data
          form.reset({
            project_id: id,
            tone: brandVoice.tone || "",
            style: brandVoice.style || "",
            language: brandVoice.language || "",
            audience: brandVoice.audience || "",
            key_messages: brandVoice.key_messages || [],
            terminology: brandVoice.terminology || {},
            avoid_phrases: brandVoice.avoid_phrases || []
          });
        }
      } catch (error: any) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectAndBrandVoice();
  }, [id, user, form]);

  const onSubmit = async (data: Partial<BrandVoice>) => {
    if (!id) return;
    
    setSaving(true);
    try {
      // Process key messages (convert from string to array if needed)
      if (typeof data.key_messages === 'string') {
        data.key_messages = (data.key_messages as string).split('\n').filter(msg => msg.trim() !== '');
      }
      
      // Process avoid phrases (convert from string to array if needed)
      if (typeof data.avoid_phrases === 'string') {
        data.avoid_phrases = (data.avoid_phrases as string).split('\n').filter(phrase => phrase.trim() !== '');
      }
      
      // Save brand voice settings
      await BrandingService.saveBrandVoice({
        ...data,
        project_id: id
      });
      
      toast({
        title: "Success",
        description: "Brand voice settings saved successfully"
      });
    } catch (error: any) {
      console.error("Error saving brand voice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save brand voice settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const generateFromAI = async () => {
    if (!id) return;
    
    setGenerating(true);
    try {
      // Get all pages for this project
      const pages = await ContentService.getProjectPages(id);
      
      if (!pages || pages.length === 0) {
        toast({
          title: "No Content",
          description: "Cannot generate brand voice - no scraped content found.",
          variant: "destructive"
        });
        return;
      }
      
      // Generate brand voice from content using AI
      toast({
        title: "AI Analysis",
        description: "Analyzing website content with AI...",
      });
      
      const generatedBrandVoice = await BrandingService.generateBrandVoiceFromAI(id, pages);
      
      // Update the form with generated values
      form.reset({
        ...form.getValues(),
        ...generatedBrandVoice
      });
      
      toast({
        title: "AI Analysis Complete",
        description: "Brand voice settings were generated using AI!",
      });
    } catch (error: any) {
      console.error("Error generating brand voice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate brand voice settings",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container max-w-4xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Brush className="h-6 w-6 mr-2 text-indigo-600" />
                  Brand Voice Settings
                </h1>
                {project && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Globe className="h-4 w-4 mr-1" />
                    {project.title || "Untitled Project"}
                  </div>
                )}
              </div>
              
              <BrandVoiceActions
                onGenerateAI={generateFromAI}
                onSave={form.handleSubmit(onSubmit)}
                generating={generating}
                saving={saving}
              />
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Brand Voice Configuration</CardTitle>
                <CardDescription>
                  Define how the AI should communicate on behalf of this brand. These settings will be used to customize AI outputs.
                  Click "AI Analysis" to have our AI analyze your website content and suggest brand voice settings.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <BrandVoiceForm
              form={form}
              onSubmit={onSubmit}
              saving={saving}
            />
          </>
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default BrandingDetails;
