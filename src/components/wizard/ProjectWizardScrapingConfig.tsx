
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface ScrapingConfigSettings {
  crawlEntireSite: boolean;
  maxPages: number;
  crawlDepth: number;
  includePatterns: string[];
  excludePatterns: string[];
  generateEmbeddings: boolean;
}

interface ProjectWizardScrapingConfigProps {
  settings: ScrapingConfigSettings;
  updateSettings: (settings: Partial<ScrapingConfigSettings>) => void;
}

export function ProjectWizardScrapingConfig({ settings, updateSettings }: ProjectWizardScrapingConfigProps) {
  const handleIncludePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const patterns = e.target.value.split(",").map(p => p.trim()).filter(p => p !== "");
    updateSettings({ includePatterns: patterns });
  };
  
  const handleExcludePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const patterns = e.target.value.split(",").map(p => p.trim()).filter(p => p !== "");
    updateSettings({ excludePatterns: patterns });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Scraping Configuration</h2>
        <p className="text-gray-500 mb-6">Configure how we should scrape your website content.</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="crawl-entire-site" 
            checked={settings.crawlEntireSite}
            onCheckedChange={(checked) => 
              updateSettings({ crawlEntireSite: checked === true })
            }
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="crawl-entire-site" className="cursor-pointer">
              Crawl entire website
            </Label>
            <p className="text-sm text-gray-500">
              If disabled, we'll only scrape the main URL you provided.
            </p>
          </div>
        </div>
        
        {settings.crawlEntireSite && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-pages">Maximum Pages: {settings.maxPages}</Label>
                <Slider
                  id="max-pages"
                  min={10}
                  max={500}
                  step={10}
                  value={[settings.maxPages]}
                  onValueChange={(value) => updateSettings({ maxPages: value[0] })}
                />
                <p className="text-xs text-gray-500">
                  Limit the number of pages to scrape (10-500).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crawl-depth">Crawl Depth: {settings.crawlDepth}</Label>
                <Slider
                  id="crawl-depth"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.crawlDepth]}
                  onValueChange={(value) => updateSettings({ crawlDepth: value[0] })}
                />
                <p className="text-xs text-gray-500">
                  How many links deep should we follow (1-10).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="include-patterns">Include URL Patterns</Label>
                <Input
                  id="include-patterns"
                  placeholder="/blog/*, /products/*"
                  value={settings.includePatterns.join(", ")}
                  onChange={handleIncludePatternChange}
                />
                <p className="text-xs text-gray-500">
                  Optional: Comma-separated patterns to include (e.g., /blog/*, /products/*).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exclude-patterns">Exclude URL Patterns</Label>
                <Input
                  id="exclude-patterns"
                  placeholder="/admin/*, /cart/*"
                  value={settings.excludePatterns.join(", ")}
                  onChange={handleExcludePatternChange}
                />
                <p className="text-xs text-gray-500">
                  Optional: Comma-separated patterns to exclude (e.g., /admin/*, /cart/*).
                </p>
              </div>
            </div>
          </>
        )}
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="generate-embeddings" 
            checked={settings.generateEmbeddings}
            onCheckedChange={(checked) => 
              updateSettings({ generateEmbeddings: checked === true })
            }
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="generate-embeddings" className="cursor-pointer">
              Generate AI embeddings
            </Label>
            <p className="text-sm text-gray-500">
              Create AI embeddings for your content to enable advanced chat and search features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
