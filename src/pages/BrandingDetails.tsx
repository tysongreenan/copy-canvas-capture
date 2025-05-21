
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { BrandingService, BrandVoice } from "@/services/BrandingService";
import { ContentService } from "@/services/ContentService";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Brush, Globe, Edit, Save, Wand2, Search } from "lucide-react";
import { SEOContentSummary } from "@/components/project/SEOContentSummary";

const BrandingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("tone");
  
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
              
              <div className="flex gap-2">
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
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Brand Voice Configuration</CardTitle>
                <CardDescription>
                  Define how the AI should communicate on behalf of this brand. These settings will be used to customize AI outputs.
                  Click "Auto-Generate" to extract brand voice settings from your website content.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="tone">Tone & Style</TabsTrigger>
                    <TabsTrigger value="content">Content Guidelines</TabsTrigger>
                    <TabsTrigger value="language">Language Preferences</TabsTrigger>
                    <TabsTrigger value="seo">
                      <Search className="h-4 w-4 mr-2" />
                      SEO Content
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tone" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Tone</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., Professional, friendly, conversational, authoritative..." 
                              {...field} 
                              className="min-h-20"
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the overall tone the AI should adopt when writing as this brand.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Writing Style</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., Concise with short paragraphs, data-driven, storytelling approach..." 
                              {...field} 
                              className="min-h-20"
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the writing style in terms of structure, sentence length, and stylistic choices.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., Technical professionals, small business owners, parents of young children..." 
                              {...field} 
                              className="min-h-20"
                            />
                          </FormControl>
                          <FormDescription>
                            Describe who the content is primarily created for to help the AI adjust accordingly.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="key_messages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Messages</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter key messages or brand points (one per line)" 
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="min-h-32"
                            />
                          </FormControl>
                          <FormDescription>
                            List important messages or value propositions the brand wants to emphasize (one per line).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="avoid_phrases"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phrases to Avoid</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter phrases to avoid (one per line)" 
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="min-h-24"
                            />
                          </FormControl>
                          <FormDescription>
                            List words, phrases or topics to avoid in brand communications (one per line).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="language" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language Preferences</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., American English, British English, simple language avoiding jargon..." 
                              {...field} 
                              className="min-h-24"
                            />
                          </FormControl>
                          <FormDescription>
                            Specify language preferences including regional variations and complexity level.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="terminology"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Terminology</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="product: Lumen AI&#10;platform: content marketing assistant&#10;..." 
                              value={Object.entries(field.value || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                const terminology: Record<string, string> = {};
                                
                                lines.forEach(line => {
                                  const parts = line.split(':');
                                  if (parts.length >= 2) {
                                    const key = parts[0].trim();
                                    const value = parts.slice(1).join(':').trim();
                                    if (key && value) {
                                      terminology[key] = value;
                                    }
                                  }
                                });
                                
                                field.onChange(terminology);
                              }}
                              className="min-h-32 font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter key terms and their preferred descriptions in format "term: description" (one per line).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="seo">
                    <div className="mb-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            Scraped SEO Content
                          </CardTitle>
                          <CardDescription>
                            Analysis of your website's SEO content and structure from the scraped data. Use this information to improve your brand voice settings.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                    {id && <SEOContentSummary projectId={id} />}
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
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
              </form>
            </Form>
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
