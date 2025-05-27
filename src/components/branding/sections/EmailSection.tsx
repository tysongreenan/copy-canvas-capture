
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Clock } from "lucide-react";

export function EmailSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Templates</h2>
        <p className="text-gray-600">Manage email templates and campaigns with your brand voice.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Email template management and brand-consistent email generation will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Email Templates</h3>
            <p className="text-gray-500 max-w-md">
              Create and manage email templates that automatically apply your brand voice and tone. 
              Generate marketing emails, newsletters, and customer communications that stay consistent with your brand.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
