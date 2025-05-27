
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEOContentSummary } from "@/components/project/SEOContentSummary";

interface SEOSectionProps {
  projectId: string;
}

export function SEOSection({ projectId }: SEOSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">SEO Content Analysis</h2>
        <p className="text-gray-600">Analysis of your website's SEO content and structure from the scraped data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Website SEO Analysis
          </CardTitle>
          <CardDescription>
            Use this information to improve your brand voice settings and content strategy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SEOContentSummary projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
