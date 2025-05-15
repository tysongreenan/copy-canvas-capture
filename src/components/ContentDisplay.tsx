
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
import { Copy, Check } from "lucide-react";
import type { ScrapedContent } from "@/services/ScraperService";
import { SaveButton } from "@/components/SaveButton";
import { useAuth } from "@/context/AuthContext";

interface ContentDisplayProps {
  data: ScrapedContent;
}

export function ContentDisplay({ data }: ContentDisplayProps) {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
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
            <div className="font-medium truncate" title={data.url}>
              {getDomainFromUrl(data.url)}
            </div>
            <div className="text-xs text-gray-500">
              Updated just now
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
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
      </Tabs>
    </div>
  );
}
