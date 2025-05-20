
import { BrandVoice } from "@/services/BrandingService";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface BrandVoiceFormProps {
  form: UseFormReturn<Partial<BrandVoice>>;
  onSubmit: (data: Partial<BrandVoice>) => Promise<void>;
  saving: boolean;
}

export function BrandVoiceForm({ form, onSubmit, saving }: BrandVoiceFormProps) {
  const [activeTab, setActiveTab] = useState("tone");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tone">Tone & Style</TabsTrigger>
            <TabsTrigger value="content">Content Guidelines</TabsTrigger>
            <TabsTrigger value="language">Language Preferences</TabsTrigger>
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
  );
}
