
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContentPreview } from "@/components/branding/ContentPreview";
import { RescanTab } from "@/components/project/RescanTab";
import { BrandVoice } from "@/services/BrandingService";

interface ContentSectionProps {
  projectId: string;
  brandVoice: Partial<BrandVoice>;
  project: any;
}

export function ContentSection({ projectId, brandVoice, project }: ContentSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Website Content</h2>
        <p className="text-gray-600">Preview how your brand voice settings affect content generation and manage your website content.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Preview</CardTitle>
          <CardDescription>
            See how your brand voice settings influence AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentPreview brandVoice={brandVoice} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Management</CardTitle>
          <CardDescription>
            Update and rescan your website content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project && <RescanTab project={project} />}
        </CardContent>
      </Card>
    </div>
  );
}
