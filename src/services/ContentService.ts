
import { supabase } from "@/integrations/supabase/client";
import type { ScrapedContent } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";

export interface SavedProject {
  id: string;
  title: string;
  url: string;
  created_at: string;
  page_count: number;
  user_id: string;
}

export const ContentService = {
  saveProject: async (title: string, startUrl: string, contents: ScrapedContent[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "Authentication required",
          description: "Please login to save scraped content",
          variant: "destructive"
        });
        return null;
      }
      
      // First save the project
      const { data: project, error: projectError } = await supabase
        .from('scraped_projects')
        .insert({
          user_id: user.user.id,
          title: title,
          url: startUrl,
          page_count: contents.length
        })
        .select('*')
        .single();
      
      if (projectError) {
        console.error("Error saving project:", projectError);
        toast({
          title: "Save failed",
          description: projectError.message || "Failed to save project",
          variant: "destructive"
        });
        return null;
      }
      
      // Then save each page content linked to the project
      for (const content of contents) {
        // Prepare the content for storage (converting specific data to JSONB)
        const jsonContent = {
          headings: content.headings,
          paragraphs: content.paragraphs,
          links: content.links,
          listItems: content.listItems,
          metaDescription: content.metaDescription,
          metaKeywords: content.metaKeywords
        };
        
        const { error } = await supabase
          .from('scraped_content')
          .insert({
            user_id: user.user.id,
            project_id: project.id,
            url: content.url,
            title: content.title,
            content: jsonContent
          });
        
        if (error) {
          console.error("Error saving content page:", error);
        }
      }
      
      toast({
        title: "Project saved",
        description: `Project with ${contents.length} pages saved successfully`
      });
      
      return project as SavedProject;
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save project content",
        variant: "destructive"
      });
      return null;
    }
  },
  
  saveContent: async (content: ScrapedContent) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "Authentication required",
          description: "Please login to save scraped content",
          variant: "destructive"
        });
        return null;
      }
      
      // Prepare the content for storage (converting specific data to JSONB)
      const jsonContent = {
        headings: content.headings,
        paragraphs: content.paragraphs,
        links: content.links,
        listItems: content.listItems,
        metaDescription: content.metaDescription,
        metaKeywords: content.metaKeywords
      };
      
      const { data, error } = await supabase
        .from('scraped_content')
        .insert({
          user_id: user.user.id,
          url: content.url,
          title: content.title,
          content: jsonContent
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving content:", error);
        toast({
          title: "Save failed",
          description: error.message || "Failed to save scraped content",
          variant: "destructive"
        });
        return null;
      }
      
      toast({
        title: "Content saved",
        description: "Scraped content saved successfully"
      });
      
      return data;
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save scraped content",
        variant: "destructive"
      });
      return null;
    }
  },
  
  getUserProjects: async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Fetch failed",
          description: error.message || "Failed to fetch saved projects",
          variant: "destructive"
        });
        return [];
      }
      
      return data as SavedProject[];
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Fetch failed",
        description: error.message || "Failed to fetch saved projects",
        variant: "destructive"
      });
      return [];
    }
  },
  
  getUserContent: async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Fetch failed",
          description: error.message || "Failed to fetch saved content",
          variant: "destructive"
        });
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error("Error fetching content:", error);
      toast({
        title: "Fetch failed",
        description: error.message || "Failed to fetch saved content",
        variant: "destructive"
      });
      return [];
    }
  },
  
  getProjectById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('scraped_projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Fetch failed",
          description: error.message || "Failed to fetch project details",
          variant: "destructive"
        });
        return null;
      }
      
      return data as SavedProject;
    } catch (error: any) {
      console.error("Error fetching project:", error);
      toast({
        title: "Fetch failed",
        description: error.message || "Failed to fetch project details",
        variant: "destructive"
      });
      return null;
    }
  },
  
  getProjectPages: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('scraped_content')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching project pages:", error);
        toast({
          title: "Fetch failed",
          description: error.message || "Failed to fetch project pages",
          variant: "destructive"
        });
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error("Error fetching project pages:", error);
      toast({
        title: "Fetch failed",
        description: error.message || "Failed to fetch project pages",
        variant: "destructive"
      });
      return [];
    }
  }
};
