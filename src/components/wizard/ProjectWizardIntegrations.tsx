
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Search, BarChart } from "lucide-react";

interface IntegrationsSettings {
  googleSearchConsole: {
    connected: boolean;
    property: string;
  };
  googleAnalytics: {
    connected: boolean;
    property: string;
  };
}

interface ProjectWizardIntegrationsProps {
  settings: IntegrationsSettings;
  updateSettings: (settings: Partial<IntegrationsSettings>) => void;
}

export function ProjectWizardIntegrations({ settings, updateSettings }: ProjectWizardIntegrationsProps) {
  const [searchConsoleProperty, setSearchConsoleProperty] = useState(settings.googleSearchConsole.property);
  const [analyticsProperty, setAnalyticsProperty] = useState(settings.googleAnalytics.property);
  
  const handleConnectSearchConsole = () => {
    // In a real implementation, this would handle OAuth flow with Google
    // For now, we'll simulate a successful connection
    toast({
      title: "Connecting to Google Search Console",
      description: "Please wait while we connect to your account...",
    });
    
    // Simulate OAuth flow
    setTimeout(() => {
      updateSettings({
        googleSearchConsole: {
          connected: true,
          property: searchConsoleProperty,
        }
      });
      
      toast({
        title: "Connected to Google Search Console",
        description: "Your Search Console account has been successfully connected.",
      });
    }, 1500);
  };
  
  const handleConnectAnalytics = () => {
    // In a real implementation, this would handle OAuth flow with Google
    // For now, we'll simulate a successful connection
    toast({
      title: "Connecting to Google Analytics",
      description: "Please wait while we connect to your account...",
    });
    
    // Simulate OAuth flow
    setTimeout(() => {
      updateSettings({
        googleAnalytics: {
          connected: true,
          property: analyticsProperty,
        }
      });
      
      toast({
        title: "Connected to Google Analytics",
        description: "Your Analytics account has been successfully connected.",
      });
    }, 1500);
  };
  
  const handleDisconnectSearchConsole = () => {
    updateSettings({
      googleSearchConsole: {
        connected: false,
        property: "",
      }
    });
    setSearchConsoleProperty("");
    
    toast({
      title: "Disconnected from Google Search Console",
      description: "Your Search Console account has been disconnected.",
    });
  };
  
  const handleDisconnectAnalytics = () => {
    updateSettings({
      googleAnalytics: {
        connected: false,
        property: "",
      }
    });
    setAnalyticsProperty("");
    
    toast({
      title: "Disconnected from Google Analytics",
      description: "Your Analytics account has been disconnected.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Integrations</h2>
        <p className="text-gray-500 mb-6">Connect your analytics and SEO tools for enhanced insights.</p>
      </div>
      
      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Google Search Console</h3>
                  <p className="text-sm text-gray-500">Connect to access search performance data</p>
                </div>
              </div>
              
              {!settings.googleSearchConsole.connected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleConnectSearchConsole}
                >
                  Connect
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnectSearchConsole}
                >
                  Disconnect
                </Button>
              )}
            </div>
            
            {!settings.googleSearchConsole.connected ? (
              <div className="space-y-2">
                <Label htmlFor="search-console-property">Property URL</Label>
                <Input
                  id="search-console-property"
                  placeholder="https://example.com"
                  value={searchConsoleProperty}
                  onChange={(e) => setSearchConsoleProperty(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Enter the URL of your property in Google Search Console.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-green-50 rounded-md text-green-700 text-sm">
                Connected to: {settings.googleSearchConsole.property}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Google Analytics</h3>
                  <p className="text-sm text-gray-500">Connect to access traffic and user behavior data</p>
                </div>
              </div>
              
              {!settings.googleAnalytics.connected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleConnectAnalytics}
                >
                  Connect
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnectAnalytics}
                >
                  Disconnect
                </Button>
              )}
            </div>
            
            {!settings.googleAnalytics.connected ? (
              <div className="space-y-2">
                <Label htmlFor="analytics-property">Property ID</Label>
                <Input
                  id="analytics-property"
                  placeholder="GA-XXXXXXXXX"
                  value={analyticsProperty}
                  onChange={(e) => setAnalyticsProperty(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Enter your Google Analytics property ID.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-green-50 rounded-md text-green-700 text-sm">
                Connected to: {settings.googleAnalytics.property}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
