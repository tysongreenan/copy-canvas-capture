
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
    const { data, error } = await supabase
      .from('brand_voices')
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
        .from('brand_voices')
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
      
      return data as BrandVoice;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('brand_voices')
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
      
      return data as BrandVoice;
    }
  }
}
