import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Globe, Link, Square, SquareCheck } from "lucide-react";
import type { ScrapedContent } from "@/services/ScraperService";
import { SaveButton } from "@/components/SaveButton";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

interface ContentDisplayProps {
  data: ScrapedContent;
}

export function ContentDisplay({ data }: ContentDisplayProps) {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [isReviewed, setIsReviewed] = useState(false);
  const { user } = useAuth();
  
  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied({ ...copied, [section]: true });
        
        toast({
          title: "Copied to clipboard",
          description: `${section} content copied successfully`,
        });
        
        setTimeout(() => {
          setCopied({ ...copied, [section]: false });
        }, 2000);
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy content to clipboard",
          variant: "destructive",
        });
      });
  };
  
  // Get domain from URL
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };
  
  // Get path from URL
  const getPathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (e) {
      return url;
    }
  };

  // Generate structured content mimicking the original website layout
  const generateStructuredContent = () => {
    let structuredContent = "";
    
    // Add title
    if (data.title) {
      structuredContent += `<h1>${data.title}</h1>\n\n`;
    }
    
    // Add meta description if available
    if (data.metaDescription) {
      structuredContent += `<p class="meta-description">${data.metaDescription}</p>\n\n`;
    }
    
    // Add headings and paragraphs interleaved in a logical order
    let headingIndex = 0;
    let paragraphIndex = 0;
    let listItemIndex = 0;
    
    // Simple algorithm to interleave content in a way that might mimic page structure
    // We'll add a heading, then related paragraphs, then a list if relevant
    while (headingIndex < data.headings.length || paragraphIndex < data.paragraphs.length) {
      // Add a heading if available
      if (headingIndex < data.headings.length) {
        const heading = data.headings[headingIndex];
        structuredContent += `<${heading.tag}>${heading.text}</${heading.tag}>\n\n`;
        headingIndex++;
      }
      
      // Add up to 2 paragraphs after each heading
      for (let i = 0; i < 2; i++) {
        if (paragraphIndex < data.paragraphs.length) {
          structuredContent += `<p>${data.paragraphs[paragraphIndex]}</p>\n\n`;
          paragraphIndex++;
        }
      }
      
      // Add a few list items if we have them
      if (listItemIndex < data.listItems.length) {
        structuredContent += "<ul>\n";
        const itemsToAdd = Math.min(3, data.listItems.length - listItemIndex);
        for (let i = 0; i < itemsToAdd; i++) {
          structuredContent += `  <li>${data.listItems[listItemIndex]}</li>\n`;
          listItemIndex++;
        }
        structuredContent += "</ul>\n\n";
      }
    }
    
    // Add any remaining paragraphs
    while (paragraphIndex < data.paragraphs.length) {
      structuredContent += `<p>${data.paragraphs[paragraphIndex]}</p>\n\n`;
      paragraphIndex++;
    }
    
    // Add any remaining list items
    if (listItemIndex < data.listItems.length) {
      structuredContent += "<ul>\n";
      while (listItemIndex < data.listItems.length) {
        structuredContent += `  <li>${data.listItems[listItemIndex]}</li>\n`;
        listItemIndex++;
      }
      structuredContent += "</ul>\n\n";
    }
    
    return structuredContent;
  };
  
  const structuredContent = generateStructuredContent();
  
  return (
    <div className="mt-6 mb-10">
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            NEW
          </div>
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
            {data.title ? (
              <div className="text-xl font-bold text-gray-800 text-center px-4">{data.title}</div>
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">{getDomainFromUrl(data.url)}</span>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium flex items-center gap-1">
              <Globe className="h-4 w-4 text-indigo-600" />
              <span className="truncate" title={getDomainFromUrl(data.url)}>
                {getDomainFromUrl(data.url)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Updated just now
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
            <Link className="h-3 w-3 flex-shrink-0" />
            <span className="truncate" title={data.url}>
              {getPathFromUrl(data.url)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleCopy(data.url, "URL")}
              >
                <span className="sr-only">Copy URL</span>
                {copied["URL"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {user && <SaveButton content={data} />}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reviewed" 
                  checked={isReviewed}
                  onCheckedChange={() => setIsReviewed(!isReviewed)}
                />
                <label
                  htmlFor="reviewed"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Reviewed
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs">
                {data.headings.length} Headings
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.paragraphs.length} Paragraphs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="headings" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="headings">
            Headings <Badge variant="outline" className="ml-2">{data.headings.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="paragraphs">
            Paragraphs <Badge variant="outline" className="ml-2">{data.paragraphs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="links">
            Links <Badge variant="outline" className="ml-2">{data.links.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="listItems">
            List Items <Badge variant="outline" className="ml-2">{data.listItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="structured">
            Structured
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="headings">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Headings</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(data.headings.map(h => `${h.tag.toUpperCase()}: ${h.text}`).join('\n'), "Headings")}
                  className="h-8 w-8"
                >
                  {copied["Headings"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>All heading elements from the page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.headings.length > 0 ? (
                data.headings.map((heading, index) => (
                  <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                    <Badge className="mb-1">{heading.tag.toUpperCase()}</Badge>
                    <p>{heading.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No headings found on this page</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paragraphs">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Paragraphs</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(data.paragraphs.join('\n\n'), "Paragraphs")}
                  className="h-8 w-8"
                >
                  {copied["Paragraphs"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>All paragraph content from the page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.paragraphs.length > 0 ? (
                data.paragraphs.map((paragraph, index) => (
                  <p key={index} className="border-b pb-2 last:border-0 last:pb-0">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">No paragraphs found on this page</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="links">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Links</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(data.links.map(link => `${link.text} - ${link.url}`).join('\n'), "Links")}
                  className="h-8 w-8"
                >
                  {copied["Links"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>All links found on the page</CardDescription>
            </CardHeader>
            <CardContent>
              {data.links.length > 0 ? (
                <div className="space-y-2">
                  {data.links.map((link, index) => (
                    <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                      <p className="font-medium">{link.text}</p>
                      <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No links found on this page</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="listItems">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>List Items</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(data.listItems.map(item => `• ${item}`).join('\n'), "List Items")}
                  className="h-8 w-8"
                >
                  {copied["List Items"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>All list items found on the page</CardDescription>
            </CardHeader>
            <CardContent>
              {data.listItems.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {data.listItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No list items found on this page</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="structured">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Structured Content</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(structuredContent, "Structured")}
                  className="h-8 w-8"
                >
                  {copied["Structured"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>
                <div className="flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                    {data.url}
                  </a>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-96 text-left">
                <pre className="whitespace-pre-wrap text-sm text-left">{structuredContent}</pre>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => handleCopy(structuredContent, "Structured")}
                  className="w-full"
                >
                  {copied["Structured"] ? "Copied!" : "Copy All Content"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
