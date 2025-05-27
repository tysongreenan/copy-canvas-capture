
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit3, Clock } from "lucide-react";

export function BlogSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Blog Posts</h2>
        <p className="text-gray-600">Generate and manage blog content with your brand voice.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Blog post generation and content management tools will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Edit3 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Blog Management</h3>
            <p className="text-gray-500 max-w-md">
              Generate blog posts that perfectly match your brand voice. 
              Create content outlines, full articles, and social media snippets that maintain consistency across all your content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
