
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProjectSettings } from "@/pages/ProjectWizard";

export interface SavedProjectSettings {
  id: string;
  scraping_config: any;
  seo_settings: any;
  integrations: any;
  created_at: string;
  updated_at: string;
}

export const ProjectSettingsService = {
  saveProjectSettings: async (projectId: string, settings: ProjectSettings) => {
    try {
      // Format settings for database storage
      const { data, error } = await supabase
        .from('project_settings')
        .insert({
          id: projectId,
          scraping_config: settings.scrapingConfig,
          seo_settings: settings.seoSettings,
          integrations: settings.integrations
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving project settings:", error);
        toast({
          title: "Error",
          description: "Failed to save project settings.",
          variant: "destructive",
        });
        return null;
      }
      
      return data as SavedProjectSettings;
    } catch (error: any) {
      console.error("Error saving project settings:", error);
      toast({
        title: "Error",
        description: "Failed to save project settings.",
        variant: "destructive",
      });
      return null;
    }
  },
  
  getProjectSettings: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_settings')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error("Error fetching project settings:", error);
        return null;
      }
      
      return data as SavedProjectSettings;
    } catch (error: any) {
      console.error("Error fetching project settings:", error);
      return null;
    }
  },
  
  updateProjectSettings: async (projectId: string, settings: Partial<ProjectSettings>) => {
    try {
      // Prepare update object based on provided settings
      const updateData: any = {};
      
      if (settings.basicInfo) {
        // If we need to update basic info, we'd do it in the scraped_projects table separately
      }
      
      if (settings.scrapingConfig) {
        updateData.scraping_config = settings.scrapingConfig;
      }
      
      if (settings.seoSettings) {
        updateData.seo_settings = settings.seoSettings;
      }
      
      if (settings.integrations) {
        updateData.integrations = settings.integrations;
      }
      
      if (Object.keys(updateData).length === 0) {
        return null; // Nothing to update
      }
      
      const { data, error } = await supabase
        .from('project_settings')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating project settings:", error);
        toast({
          title: "Error",
          description: "Failed to update project settings.",
          variant: "destructive",
        });
        return null;
      }
      
      return data as SavedProjectSettings;
    } catch (error: any) {
      console.error("Error updating project settings:", error);
      toast({
        title: "Error",
        description: "Failed to update project settings.",
        variant: "destructive",
      });
      return null;
    }
  }
};
