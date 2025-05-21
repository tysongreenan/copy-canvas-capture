
// Import the supabase client
import { supabase } from '@/integrations/supabase/client';

// Define types for brand voice
export interface BrandVoice {
  id: string;
  project_id: string;
  tone?: string;
  style?: string;
  language?: string;
  audience?: string;
  key_messages?: string[];
  terminology?: Record<string, string>;
  avoid_phrases?: string[];
  created_at: string;
  updated_at: string;
}

// Define BrandingService class with static methods
export class BrandingService {
  // Get brand voice for a project
  static async getBrandVoice(projectId: string): Promise<BrandVoice | null> {
    try {
      const { data, error } = await supabase
        .from('brand_voices')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      if (error) {
        throw new Error(`Error fetching brand voice: ${error.message}`);
      }
      
      // Use proper type casting to handle potential errors
      return data as unknown as BrandVoice | null;
    } catch (error: any) {
      console.error("Error in getBrandVoice:", error);
      return null;
    }
  }
  
  // Save brand voice for a project
  static async saveBrandVoice(brandVoice: Partial<BrandVoice>): Promise<BrandVoice | null> {
    try {
      if (!brandVoice.project_id) {
        throw new Error("Project ID is required to save brand voice");
      }
      
      // Check if brand voice already exists
      const existing = await this.getBrandVoice(brandVoice.project_id);
      
      let result;
      
      if (existing) {
        // Update existing brand voice
        const { data, error } = await supabase
          .from('brand_voices')
          .update({
            tone: brandVoice.tone,
            style: brandVoice.style,
            language: brandVoice.language,
            audience: brandVoice.audience,
            key_messages: brandVoice.key_messages || [],
            terminology: brandVoice.terminology || {},
            avoid_phrases: brandVoice.avoid_phrases || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          throw new Error(`Error updating brand voice: ${error.message}`);
        }
        
        result = data as unknown as BrandVoice;
      } else {
        // Create new brand voice
        const { data, error } = await supabase
          .from('brand_voices')
          .insert([{
            project_id: brandVoice.project_id,
            tone: brandVoice.tone,
            style: brandVoice.style,
            language: brandVoice.language,
            audience: brandVoice.audience,
            key_messages: brandVoice.key_messages || [],
            terminology: brandVoice.terminology || {},
            avoid_phrases: brandVoice.avoid_phrases || []
          }])
          .select()
          .single();
        
        if (error) {
          throw new Error(`Error creating brand voice: ${error.message}`);
        }
        
        result = data as unknown as BrandVoice;
      }
      
      return result;
    } catch (error: any) {
      console.error("Error saving brand voice:", error);
      return null;
    }
  }
  
  // Analyze text with OpenAI to get brand voice suggestions
  static async analyzeBrandVoice(projectId: string, text: string): Promise<BrandVoice | null> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-brand-voice', {
        body: { text, projectId }
      });
      
      if (error) {
        throw new Error(`Error analyzing brand voice: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned from brand voice analysis");
      }
      
      // Save the analyzed brand voice
      return await this.saveBrandVoice(data as unknown as BrandVoice);
    } catch (error: any) {
      console.error("Error analyzing brand voice:", error);
      return null;
    }
  }

  // Generate brand voice from scraped pages using AI
  static async generateBrandVoiceFromAI(projectId: string, pages: any[]): Promise<BrandVoice | null> {
    try {
      // Extract text content from pages to analyze
      const pageTexts = pages.map(page => {
        return {
          url: page.url,
          title: page.title,
          content: typeof page.content === 'string' 
            ? page.content 
            : JSON.stringify(page.content)
        };
      });
      
      // Send the content to the analyze-brand-voice function
      const { data, error } = await supabase.functions.invoke('analyze-brand-voice', {
        body: { 
          projectId, 
          pages: pageTexts
        }
      });
      
      if (error) {
        throw new Error(`Error generating brand voice from AI: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned from brand voice AI analysis");
      }
      
      // Save the generated brand voice
      return await this.saveBrandVoice(data as unknown as BrandVoice);
    } catch (error: any) {
      console.error("Error generating brand voice from AI:", error);
      return null;
    }
  }
}
