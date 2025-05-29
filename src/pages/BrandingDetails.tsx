import { useState, useEffect } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { BrandingService, BrandVoice } from "@/services/BrandingService";
import { ContentService } from "@/services/ContentService";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Wand2, SlidersHorizontal } from "lucide-react";
import { BrandingDashboard } from "@/components/branding/BrandingDashboard";
import { BrandingSection } from "@/components/branding/sections/BrandingSection";
import { SEOSection } from "@/components/branding/sections/SEOSection";
import { ContentSection } from "@/components/branding/sections/ContentSection";
import { EmailSection } from "@/components/branding/sections/EmailSection";
import { BlogSection } from "@/components/branding/sections/BlogSection";
import { GuidedSetupWizard } from "@/components/branding/GuidedSetupWizard";
import { OverviewSection } from "@/components/branding/sections/OverviewSection";

const BrandingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [wizardMode, setWizardMode] = useState(false);
  
  const activeSection = searchParams.get('section') || 'overview';
  
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
      
      // Exit wizard mode after saving
      if (wizardMode) {
        setWizardMode(false);
      }
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
  
  const generateFromContent = async () => {
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
      
      // Generate brand voice from content
      const generatedBrandVoice = BrandingService.generateBrandVoiceFromContent(id, pages);
      
      // Update the form with generated values
      form.reset({
        ...form.getValues(),
        ...generatedBrandVoice
      });
      
      toast({
        title: "Generated",
        description: "Brand voice settings were generated from your website content!",
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
  
  const handleStartWizard = () => {
    setWizardMode(true);
  };
  
  const handleCompleteWizard = (data: Partial<BrandVoice>) => {
    form.reset({
      ...form.getValues(),
      ...data
    });
    onSubmit({
      ...form.getValues(),
      ...data
    });
  };

  const renderActiveSection = () => {
    if (!id) return null;

    switch (activeSection) {
      case 'overview':
        return <OverviewSection projectId={id} project={project} />;
      case 'seo':
        return <SEOSection projectId={id} />;
      case 'content':
      case 'website':
        return <ContentSection projectId={id} brandVoice={form.getValues()} project={project} />;
      case 'emails':
        return <EmailSection />;
      case 'blog':
        return <BlogSection />;
      default:
        return <BrandingSection form={form} />;
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : wizardMode ? (
        <div className="container max-w-5xl px-6 py-8">
          <GuidedSetupWizard
            initialData={form.getValues()}
            onComplete={handleCompleteWizard}
            onGenerate={generateFromContent}
            isGenerating={generating}
          />
        </div>
      ) : (
        <BrandingDashboard projectId={id || ''} activeSection={activeSection}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Brand Voice Settings</h1>
                {project && (
                  <p className="text-sm text-gray-500 mt-1">
                    {project.title || "Untitled Project"}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartWizard} 
                  variant="outline"
                  className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Setup Wizard
                </Button>
                
                <Button 
                  onClick={generateFromContent} 
                  variant="outline" 
                  className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                  disabled={generating || saving}
                >
                  {generating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Auto-Generate
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
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
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {renderActiveSection()}
              </form>
            </Form>
          </div>
        </BrandingDashboard>
      )}
    </div>
  );
};

export default BrandingDetails;
