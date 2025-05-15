
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
  
  return (
    <div className="mt-10 mb-10">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl font-bold mt-2 sm:mt-0">
          Content from {data.title || data.url}
        </h2>
        
        <div className="flex items-center gap-2">
          {user && <SaveButton content={data} />}
        </div>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Page Information</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(`Title: ${data.title}\nURL: ${data.url}\nMeta Description: ${data.metaDescription || 'None'}\nMeta Keywords: ${data.metaKeywords || 'None'}`, "Page Info")}
              className="h-8 w-8"
            >
              {copied["Page Info"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>Basic information about the page</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex flex-col">
              <dt className="font-medium">Title</dt>
              <dd>{data.title || 'No title found'}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-medium">URL</dt>
              <dd className="break-all">{data.url}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-medium">Meta Description</dt>
              <dd>{data.metaDescription || 'No meta description found'}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-medium">Meta Keywords</dt>
              <dd>{data.metaKeywords || 'No meta keywords found'}</dd>
            </div>
          </dl>
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
