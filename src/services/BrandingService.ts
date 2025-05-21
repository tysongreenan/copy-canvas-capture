import { supabase } from '@/integrations/supabase/client';

export interface BrandVoice {
  id: string;
  project_id: string;
  tone: string;
  style: string;
  language: string;
  audience: string;
  key_messages: string[];
  terminology: Record<string, string>;
  avoid_phrases: string[];
  created_at: string;
  updated_at: string;
}

export class BrandingService {
  static async getBrandVoice(projectId: string): Promise<BrandVoice | null> {
    // Use a more generic approach with as any to bypass TypeScript's strict checking
    // since the table was just created and types haven't been regenerated
    const { data, error } = await supabase
      .from('brand_voices' as any)
      .select('*')
      .eq('project_id', projectId)
      .single();
    
    if (error && error.code !== 'PGSQL_ERROR_22P02') {
      throw new Error(`Error fetching brand voice: ${error.message}`);
    }
    
    return data as BrandVoice | null;
  }

  static async saveBrandVoice(brandVoice: Partial<BrandVoice>): Promise<BrandVoice> {
    // Check if a record already exists
    const existing = await this.getBrandVoice(brandVoice.project_id as string);
    
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('brand_voices' as any)
        .update({
          ...brandVoice,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating brand voice: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Failed to update brand voice: No data returned');
      }
      
      return data as BrandVoice;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('brand_voices' as any)
        .insert([{
          ...brandVoice,
          key_messages: brandVoice.key_messages || [],
          terminology: brandVoice.terminology || {},
          avoid_phrases: brandVoice.avoid_phrases || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error creating brand voice: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Failed to create brand voice: No data returned');
      }
      
      return data as BrandVoice;
    }
  }

  // Generate a brand voice profile based on scraped content
  static generateBrandVoiceFromContent(projectId: string, scrapedContent: any[]): Partial<BrandVoice> {
    // Default values
    const brandVoice: Partial<BrandVoice> = {
      project_id: projectId,
      tone: "",
      style: "",
      language: "English",
      audience: "",
      key_messages: [],
      terminology: {},
      avoid_phrases: []
    };

    // If no content, return default
    if (!scrapedContent || scrapedContent.length === 0) {
      return brandVoice;
    }

    try {
      // Extract main page content (usually the first page)
      const mainPage = scrapedContent[0];
      const content = mainPage.content || {};

      // Extract meta description as a potential source for key messages
      if (content.metaDescription) {
        brandVoice.key_messages = [content.metaDescription];
      }

      // Extract headings to identify potential key messages and terminology
      const headings = content.headings || [];
      if (headings.length > 0) {
        // H1 and H2 headings are likely key messages
        const mainHeadings = headings.filter(h => h.tag === 'h1' || h.tag === 'h2');
        
        if (mainHeadings.length > 0) {
          // Add to existing key messages array
          brandVoice.key_messages = [
            ...(brandVoice.key_messages || []), 
            ...mainHeadings.map(h => h.text).filter(Boolean)
          ];
        }

        // Extract potential terminology from heading content
        const terminology = {};
        headings.forEach(heading => {
          if (heading.text && heading.text.includes(':')) {
            const parts = heading.text.split(':');
            if (parts.length >= 2) {
              const key = parts[0].trim();
              const value = parts.slice(1).join(':').trim();
              terminology[key] = value;
            }
          }
        });
        
        if (Object.keys(terminology).length > 0) {
          brandVoice.terminology = terminology;
        }
      }

      // Try to detect audience from content
      const paragraphs = content.paragraphs || [];
      let allText = paragraphs.join(' ').toLowerCase();

      // Simple audience detection based on common terms
      if (allText.includes('business') || allText.includes('professional') || 
          allText.includes('enterprise') || allText.includes('company')) {
        brandVoice.audience = 'Business professionals and organizations';
      } else if (allText.includes('developer') || allText.includes('coding') || 
                 allText.includes('programming') || allText.includes('tech')) {
        brandVoice.audience = 'Developers and technical professionals';
      } else if (allText.includes('customer') || allText.includes('consumer') || 
                 allText.includes('client')) {
        brandVoice.audience = 'General consumers and customers';
      }

      // Try to detect tone
      if (allText.includes('professional') || allText.includes('expert') || 
          allText.includes('trusted')) {
        brandVoice.tone = 'Professional, authoritative, and trustworthy';
      } else if (allText.includes('friendly') || allText.includes('welcome') || 
                 allText.includes('help')) {
        brandVoice.tone = 'Friendly, helpful, and approachable';
      } else if (allText.includes('innovat') || allText.includes('future') || 
                 allText.includes('cutting-edge')) {
        brandVoice.tone = 'Innovative, forward-thinking, and dynamic';
      }

      // Try to detect writing style
      if (paragraphs.length > 0) {
        const avgLength = paragraphs.map(p => p.split(' ').length).reduce((a, b) => a + b, 0) / paragraphs.length;
        
        if (avgLength < 15) {
          brandVoice.style = 'Concise with short paragraphs, direct and to-the-point';
        } else if (avgLength > 30) {
          brandVoice.style = 'Detailed with longer paragraphs, thorough explanations';
        } else {
          brandVoice.style = 'Balanced with medium-length paragraphs, clear and informative';
        }
      }

      return brandVoice;
    } catch (error) {
      console.error('Error generating brand voice from content:', error);
      return brandVoice;
    }
  }
}
