
import { supabase } from "@/integrations/supabase/client";
import type { ScrapedContent } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";

export const ContentService = {
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
        .from('scraped_content')
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
      
      return data;
    } catch (error: any) {
      console.error("Error fetching project:", error);
      toast({
        title: "Fetch failed",
        description: error.message || "Failed to fetch project details",
        variant: "destructive"
      });
      return null;
    }
  }
};
