
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandVoiceProfiler } from "@/components/branding/BrandVoiceProfiler";
import { VisualTerminologyManager } from "@/components/branding/VisualTerminologyManager";
import { UseFormReturn } from "react-hook-form";
import { BrandVoice } from "@/services/BrandingService";

interface BrandingSectionProps {
  form: UseFormReturn<Partial<BrandVoice>>;
}

export function BrandingSection({ form }: BrandingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Brand Voice & Tone</h2>
        <p className="text-gray-600">Define how your brand should communicate with your audience.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Tone</CardTitle>
          <CardDescription>
            Define the emotional tone your brand should convey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Tone</FormLabel>
                <FormControl>
                  <BrandVoiceProfiler 
                    initialTone={field.value} 
                    onToneChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Writing Style & Voice</CardTitle>
          <CardDescription>
            Describe your brand's writing style and communication approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Terminology</CardTitle>
          <CardDescription>
            Define key terms and their preferred descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="terminology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Terminology</FormLabel>
                <FormControl>
                  <VisualTerminologyManager
                    initialTerminology={field.value as Record<string, string>}
                    onTerminologyChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="mt-4">
                  Define key terms and their preferred descriptions to maintain consistent brand language.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Guidelines</CardTitle>
          <CardDescription>
            Define key messages and content to avoid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
