
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SeoSettings {
  targetSearchEngines: string[];
  countryLocation: string;
  language: string;
  includeLocalPack: boolean;
  devicePreference: "mobile" | "desktop" | "both";
}

interface ProjectWizardSeoSettingsProps {
  settings: SeoSettings;
  updateSettings: (settings: Partial<SeoSettings>) => void;
}

export function ProjectWizardSeoSettings({ settings, updateSettings }: ProjectWizardSeoSettingsProps) {
  const handleSearchEngineChange = (engine: string, checked: boolean) => {
    if (checked) {
      updateSettings({ 
        targetSearchEngines: [...settings.targetSearchEngines, engine] 
      });
    } else {
      updateSettings({ 
        targetSearchEngines: settings.targetSearchEngines.filter(e => e !== engine) 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
        <p className="text-gray-500 mb-6">Configure your SEO preferences to optimize content recommendations.</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Target Search Engines</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="google" 
                checked={settings.targetSearchEngines.includes("google")}
                onCheckedChange={(checked) => 
                  handleSearchEngineChange("google", checked === true)
                }
              />
              <Label htmlFor="google" className="cursor-pointer">Google</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bing" 
                checked={settings.targetSearchEngines.includes("bing")}
                onCheckedChange={(checked) => 
                  handleSearchEngineChange("bing", checked === true)
                }
              />
              <Label htmlFor="bing" className="cursor-pointer">Bing</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="yahoo" 
                checked={settings.targetSearchEngines.includes("yahoo")}
                onCheckedChange={(checked) => 
                  handleSearchEngineChange("yahoo", checked === true)
                }
              />
              <Label htmlFor="yahoo" className="cursor-pointer">Yahoo</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="duckduckgo" 
                checked={settings.targetSearchEngines.includes("duckduckgo")}
                onCheckedChange={(checked) => 
                  handleSearchEngineChange("duckduckgo", checked === true)
                }
              />
              <Label htmlFor="duckduckgo" className="cursor-pointer">DuckDuckGo</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country/Location</Label>
          <Select
            value={settings.countryLocation}
            onValueChange={(value) => updateSettings({ countryLocation: value })}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="JP">Japan</SelectItem>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="BR">Brazil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => updateSettings({ language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="local-pack" 
            checked={settings.includeLocalPack}
            onCheckedChange={(checked) => 
              updateSettings({ includeLocalPack: checked === true })
            }
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="local-pack" className="cursor-pointer">
              Include Google Local Pack results
            </Label>
            <p className="text-sm text-gray-500">
              Optimize for local search results (relevant for businesses with physical locations).
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Device Preference</Label>
          <RadioGroup 
            value={settings.devicePreference}
            onValueChange={(value) => 
              updateSettings({ devicePreference: value as "mobile" | "desktop" | "both" })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mobile" id="mobile" />
              <Label htmlFor="mobile" className="cursor-pointer">Mobile</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="desktop" id="desktop" />
              <Label htmlFor="desktop" className="cursor-pointer">Desktop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="cursor-pointer">Both (Responsive)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
