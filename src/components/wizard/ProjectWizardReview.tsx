
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectSettings } from "@/pages/ProjectWizard";

interface ProjectWizardReviewProps {
  settings: ProjectSettings;
  onCreateProject: () => void;
  isCreating?: boolean;
}

export function ProjectWizardReview({ settings, onCreateProject, isCreating = false }: ProjectWizardReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Review Your Project</h2>
        <p className="text-gray-500 mb-6">Review your project settings before creation.</p>
      </div>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium">Basic Information</h3>
          </div>
          
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Project Name:</span>
              <span className="font-medium">{settings.basicInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Website URL:</span>
              <span className="font-medium">{settings.basicInfo.url}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium">{settings.basicInfo.category}</span>
            </div>
            {settings.basicInfo.description && (
              <div className="flex justify-between">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{settings.basicInfo.description}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium">Scraping Configuration</h3>
          </div>
          
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Crawl Entire Site:</span>
              <span>
                {settings.scrapingConfig.crawlEntireSite ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium">No</span>
                )}
              </span>
            </div>
            
            {settings.scrapingConfig.crawlEntireSite && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Maximum Pages:</span>
                  <span className="font-medium">{settings.scrapingConfig.maxPages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Crawl Depth:</span>
                  <span className="font-medium">{settings.scrapingConfig.crawlDepth}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Generate AI Embeddings:</span>
              <span>
                {settings.scrapingConfig.generateEmbeddings ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium">No</span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium">SEO Settings</h3>
          </div>
          
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Target Search Engines:</span>
              <span className="font-medium">{settings.seoSettings.targetSearchEngines.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Country/Location:</span>
              <span className="font-medium">{settings.seoSettings.countryLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Language:</span>
              <span className="font-medium">{settings.seoSettings.language}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Include Local Pack:</span>
              <span>
                {settings.seoSettings.includeLocalPack ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium">No</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Device Preference:</span>
              <span className="font-medium capitalize">{settings.seoSettings.devicePreference}</span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium">Integrations</h3>
          </div>
          
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Google Search Console:</span>
              <span>
                {settings.integrations.googleSearchConsole.connected ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium">Not Connected</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Google Analytics:</span>
              <span>
                {settings.integrations.googleAnalytics.connected ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium">Not Connected</span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700">
          <p className="text-sm">
            <strong>Next steps after creation:</strong> Once your project is created, you'll be directed to the Import tab where you can start scraping your website content. You can also set up Branding Details for your project.
          </p>
        </div>
        
        <div className="pt-4 flex justify-center">
          <Button 
            size="lg"
            onClick={onCreateProject}
            className="px-8"
            disabled={isCreating}
          >
            {isCreating ? "Creating Project..." : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
