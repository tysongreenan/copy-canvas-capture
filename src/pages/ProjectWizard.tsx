import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectWizardBasicInfo } from "@/components/wizard/ProjectWizardBasicInfo";
import { ProjectWizardDataIngestion } from "@/components/wizard/ProjectWizardDataIngestion";
import { ProjectWizardScrapingConfig } from "@/components/wizard/ProjectWizardScrapingConfig";
import { ProjectWizardSeoSettings } from "@/components/wizard/ProjectWizardSeoSettings";
import { ProjectWizardIntegrations } from "@/components/wizard/ProjectWizardIntegrations";
import { ProjectWizardReview } from "@/components/wizard/ProjectWizardReview";
import { toast } from "@/hooks/use-toast";
import { ContentService } from "@/services/ContentService";
import { ProjectSettingsService } from "@/services/ProjectSettingsService";
import { YouTubeService } from "@/services/YouTubeService";
import { ResearchService } from "@/services/ResearchService";

// Wizard step type definition
type WizardStep = "basic-info" | "data-ingestion" | "scraping-config" | "seo-settings" | "integrations" | "review";

// Default project settings
export interface ProjectSettings {
  basicInfo: {
    url: string;
    name: string;
    description: string;
    category: string;
  };
  scrapingConfig: {
    crawlEntireSite: boolean;
    maxPages: number;
    crawlDepth: number;
    includePatterns: string[];
    excludePatterns: string[];
    generateEmbeddings: boolean;
  };
  dataIngestion: {
    youtubeVideos: string[];
    researchKeywords: string[];
    competitors: string[];
  };
  seoSettings: {
    targetSearchEngines: string[];
    countryLocation: string;
    language: string;
    includeLocalPack: boolean;
    devicePreference: "mobile" | "desktop" | "both";
  };
  integrations: {
    googleSearchConsole: {
      connected: boolean;
      property: string;
    };
    googleAnalytics: {
      connected: boolean;
      property: string;
    };
  };
}

const ProjectWizard = () => {
  const { user, currentTeamId } = useAuth();
  const navigate = useNavigate();
  
  // State for the active wizard step
  const [activeStep, setActiveStep] = useState<WizardStep>("basic-info");
  const [isCreating, setIsCreating] = useState(false);
  
  // State for project settings
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    basicInfo: {
      url: "",
      name: "",
      description: "",
      category: "business",
    },
    scrapingConfig: {
      crawlEntireSite: true,
      maxPages: 100,
      crawlDepth: 3,
      includePatterns: [],
      excludePatterns: [],
      generateEmbeddings: true,
    },
    dataIngestion: {
      youtubeVideos: [],
      researchKeywords: [],
      competitors: [],
    },
    seoSettings: {
      targetSearchEngines: ["google"],
      countryLocation: "US",
      language: "en",
      includeLocalPack: true,
      devicePreference: "both",
    },
    integrations: {
      googleSearchConsole: {
        connected: false,
        property: "",
      },
      googleAnalytics: {
        connected: false,
        property: "",
      },
    },
  });
  
  // Check if basic information is valid
  const isBasicInfoValid = () => {
    return projectSettings.basicInfo.url.trim() !== "" && 
           projectSettings.basicInfo.name.trim() !== "";
  };
  
  // Update project settings
  const updateSettings = (section: keyof ProjectSettings, data: any) => {
    setProjectSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };
  
  // Handle step navigation
  const goToNextStep = () => {
    switch (activeStep) {
      case "basic-info":
        if (!isBasicInfoValid()) {
          toast({
            title: "Required Information Missing",
            description: "Please enter a website URL and project name.",
            variant: "destructive",
          });
          return;
        }
        setActiveStep("data-ingestion");
        break;
      case "data-ingestion":
        setActiveStep("scraping-config");
        break;
      case "scraping-config":
        setActiveStep("seo-settings");
        break;
      case "seo-settings":
        setActiveStep("integrations");
        break;
      case "integrations":
        setActiveStep("review");
        break;
      default:
        break;
    }
  };
  
  const goToPreviousStep = () => {
    switch (activeStep) {
      case "data-ingestion":
        setActiveStep("basic-info");
        break;
      case "scraping-config":
        setActiveStep("data-ingestion");
        break;
      case "seo-settings":
        setActiveStep("scraping-config");
        break;
      case "integrations":
        setActiveStep("seo-settings");
        break;
      case "review":
        setActiveStep("integrations");
        break;
      default:
        break;
    }
  };
  
  // Create project
  const handleCreateProject = async () => {
    try {
      setIsCreating(true);
      toast({
        title: "Creating Project",
        description: "Setting up your new project...",
      });
      
      // Create an empty initial content array (will be populated later when scraping)
      const emptyContent = [];
      
      // Save the project using ContentService
      const savedProject = await ContentService.saveProject(
        projectSettings.basicInfo.name,
        projectSettings.basicInfo.url,
        emptyContent,
        currentTeamId || null
      );
      
      if (!savedProject) {
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }
      
      // Save the additional project settings
      await ProjectSettingsService.saveProjectSettings(savedProject.id, projectSettings);
      
      // Process YouTube videos if any
      if (projectSettings.dataIngestion.youtubeVideos.length > 0) {
        toast({
          title: "Processing YouTube Videos",
          description: `Processing ${projectSettings.dataIngestion.youtubeVideos.length} videos...`,
        });
        
        const youtubeResult = await YouTubeService.processMultipleVideos(
          projectSettings.dataIngestion.youtubeVideos,
          savedProject.id
        );
        
        if (youtubeResult.successful > 0) {
          toast({
            title: "YouTube Videos Processed",
            description: `Successfully processed ${youtubeResult.successful} videos`,
          });
        }
      }
      
      // Conduct research if keywords provided
      if (projectSettings.dataIngestion.researchKeywords.length > 0) {
        toast({
          title: "Conducting Research",
          description: `Researching ${projectSettings.dataIngestion.researchKeywords.length} topics...`,
        });
        
        const researchResult = await ResearchService.conductMultipleResearch(
          projectSettings.dataIngestion.researchKeywords,
          savedProject.id
        );
        
        if (researchResult.successful > 0) {
          toast({
            title: "Research Completed",
            description: `Successfully researched ${researchResult.successful} topics`,
          });
        }
      }
      
      // Research competitors if any
      if (projectSettings.dataIngestion.competitors.length > 0) {
        toast({
          title: "Analyzing Competitors",
          description: `Analyzing ${projectSettings.dataIngestion.competitors.length} competitors...`,
        });
        
        for (const competitor of projectSettings.dataIngestion.competitors) {
          await ResearchService.researchCompetitor(competitor, savedProject.id);
        }
      }
      
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
      });
      
      // Navigate to the project page, specifically to the import tab for immediate content scraping
      navigate(`/project/${savedProject.id}?tab=import`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-gray-500 mt-2">Set up your project to get the most out of Lumen</p>
        </div>
        
        <Card className="border-0 shadow-md">
          <Tabs value={activeStep} className="w-full">
            <div className="border-b px-6 py-3">
              <TabsList className="w-full justify-start gap-2 h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="basic-info" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 font-medium py-3"
                  disabled
                >
                  1. Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="data-ingestion" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 font-medium py-3"
                  disabled
                >
                  2. Data Ingestion
                </TabsTrigger>
                <TabsTrigger 
                  value="scraping-config" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 font-medium py-3"
                  disabled
                >
                  3. Scraping
                </TabsTrigger>
                <TabsTrigger 
                  value="seo-settings" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 font-medium py-3"
                  disabled
                >
                  4. SEO
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 font-medium py-3"
                  disabled
                >
                  5. Integrations
                </TabsTrigger>
                <TabsTrigger 
                  value="review" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 font-medium py-3"
                  disabled
                >
                  6. Review
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-6">
              <TabsContent value="basic-info" className="mt-0">
                <ProjectWizardBasicInfo 
                  settings={projectSettings.basicInfo} 
                  updateSettings={(data) => updateSettings("basicInfo", data)} 
                />
              </TabsContent>
              
              <TabsContent value="data-ingestion" className="mt-0">
                <ProjectWizardDataIngestion 
                  settings={projectSettings.dataIngestion} 
                  updateSettings={(data) => updateSettings("dataIngestion", data)} 
                />
              </TabsContent>
              
              <TabsContent value="scraping-config" className="mt-0">
                <ProjectWizardScrapingConfig 
                  settings={projectSettings.scrapingConfig} 
                  updateSettings={(data) => updateSettings("scrapingConfig", data)} 
                />
              </TabsContent>
              
              <TabsContent value="seo-settings" className="mt-0">
                <ProjectWizardSeoSettings 
                  settings={projectSettings.seoSettings} 
                  updateSettings={(data) => updateSettings("seoSettings", data)} 
                />
              </TabsContent>
              
              <TabsContent value="integrations" className="mt-0">
                <ProjectWizardIntegrations 
                  settings={projectSettings.integrations} 
                  updateSettings={(data) => updateSettings("integrations", data)} 
                />
              </TabsContent>
              
              <TabsContent value="review" className="mt-0">
                <ProjectWizardReview 
                  settings={projectSettings} 
                  onCreateProject={handleCreateProject}
                  isCreating={isCreating}
                />
              </TabsContent>
              
              <div className="flex justify-between mt-8">
                {activeStep !== "basic-info" && (
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousStep}
                    disabled={isCreating}
                  >
                    Back
                  </Button>
                )}
                
                {activeStep !== "review" ? (
                  <Button 
                    onClick={goToNextStep}
                    className="ml-auto"
                    disabled={isCreating}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateProject}
                    className="ml-auto"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default ProjectWizard;
