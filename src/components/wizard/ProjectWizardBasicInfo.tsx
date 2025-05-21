
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectService } from "@/services/ProjectService";

interface BasicInfoSettings {
  url: string;
  name: string;
  description: string;
  category: string;
}

interface ProjectWizardBasicInfoProps {
  settings: BasicInfoSettings;
  updateSettings: (settings: Partial<BasicInfoSettings>) => void;
}

export function ProjectWizardBasicInfo({ settings, updateSettings }: ProjectWizardBasicInfoProps) {
  const [url, setUrl] = useState(settings.url);
  
  // Auto-generate project name from URL when URL changes
  useEffect(() => {
    if (url && (!settings.name || settings.name === "")) {
      const projectName = ProjectService.getProjectNameFromUrl(url);
      updateSettings({ name: projectName });
    }
  }, [url, settings.name, updateSettings]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    updateSettings({ url: e.target.value });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <p className="text-gray-500 mb-6">Let's start with the basic details of your project.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL <span className="text-red-500">*</span></Label>
          <Input
            id="website-url"
            placeholder="https://example.com"
            value={settings.url}
            onChange={handleUrlChange}
          />
          <p className="text-xs text-gray-500">
            Enter the main URL of your website. We'll use this to scrape content.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name <span className="text-red-500">*</span></Label>
          <Input
            id="project-name"
            placeholder="My Project"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-description">Project Description</Label>
          <Textarea
            id="project-description"
            placeholder="A brief description of your project..."
            value={settings.description}
            onChange={(e) => updateSettings({ description: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-category">Project Category</Label>
          <Select
            value={settings.category}
            onValueChange={(value) => updateSettings({ category: value })}
          >
            <SelectTrigger id="project-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="e-commerce">E-Commerce</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
