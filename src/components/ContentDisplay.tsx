
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ScrapedContent } from "@/services/ScraperService";

interface ContentDisplayProps {
  data: ScrapedContent | null;
}

export function ContentDisplay({ data }: ContentDisplayProps) {
  const [activeTab, setActiveTab] = useState("all");

  if (!data) {
    return null;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    });
  };

  // Prepare content blocks for easy copying
  const headingsText = data.headings.map(h => h.text).join('\n\n');
  const paragraphsText = data.paragraphs.join('\n\n');
  const linksText = data.links.map(l => `${l.text} - ${l.url}`).join('\n');
  const listItemsText = data.listItems.join('\n');
  
  const allContent = [
    `Title: ${data.title}`,
    data.metaDescription ? `Meta Description: ${data.metaDescription}` : '',
    data.metaKeywords ? `Meta Keywords: ${data.metaKeywords}` : '',
    '\n--- HEADINGS ---',
    headingsText,
    '\n--- PARAGRAPHS ---',
    paragraphsText,
    '\n--- LINKS ---',
    linksText,
    '\n--- LIST ITEMS ---',
    listItemsText
  ].filter(Boolean).join('\n\n');

  return (
    <Card className="w-full mt-8 bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {data.title || "Scraped Content"}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{data.url}</p>
          </div>
          
          <Button
            onClick={() => copyToClipboard(allContent, "All content")}
            variant="outline"
            className="h-9 gap-2 hover:bg-gray-100"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            Copy All
          </Button>
        </div>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="px-6 border-b border-gray-100">
          <TabsList className="h-10 bg-transparent gap-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md">
              All Content
            </TabsTrigger>
            <TabsTrigger value="headings" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md">
              Headings
              <Badge variant="outline" className="ml-1 bg-gray-50">{data.headings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="paragraphs" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md">
              Paragraphs
              <Badge variant="outline" className="ml-1 bg-gray-50">{data.paragraphs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="links" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md">
              Links
              <Badge variant="outline" className="ml-1 bg-gray-50">{data.links.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md">
              List Items
              <Badge variant="outline" className="ml-1 bg-gray-50">{data.listItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="meta" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md">
              Meta Info
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[500px] lg:h-[600px]">
              <div className="p-6 space-y-6">
                {data.metaDescription && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Meta Description</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                      {data.metaDescription}
                    </div>
                  </div>
                )}
                
                {data.headings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">Headings</h3>
                      <Button
                        onClick={() => copyToClipboard(headingsText, "Headings")}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1"
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                          <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        Copy
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {data.headings.map((heading, i) => (
                        <div 
                          key={i} 
                          className="bg-gray-50 p-3 rounded-md"
                          style={{ 
                            marginLeft: heading.tag === 'h1' ? '0' : 
                                       heading.tag === 'h2' ? '1rem' :
                                       heading.tag === 'h3' ? '2rem' : 
                                       heading.tag === 'h4' ? '3rem' : 
                                       heading.tag === 'h5' ? '4rem' : '5rem'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">{heading.text}</span>
                            <Badge variant="outline" className="text-xs">{heading.tag}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.paragraphs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">Paragraphs</h3>
                      <Button
                        onClick={() => copyToClipboard(paragraphsText, "Paragraphs")}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1"
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                          <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        Copy
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {data.paragraphs.map((paragraph, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-md text-gray-700">
                          {paragraph}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.links.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">Links</h3>
                      <Button
                        onClick={() => copyToClipboard(linksText, "Links")}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1"
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                          <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        Copy
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {data.links.map((link, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">{link.text}</span>
                            <span className="text-blue-500 text-sm truncate max-w-[200px]">{link.url}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.listItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">List Items</h3>
                      <Button
                        onClick={() => copyToClipboard(listItemsText, "List items")}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1"
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                          <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        Copy
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {data.listItems.map((item, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-md text-gray-700">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="headings" className="m-0">
            <ScrollArea className="h-[500px] lg:h-[600px]">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">Headings</h3>
                  <Button
                    onClick={() => copyToClipboard(headingsText, "Headings")}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                      <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    Copy All
                  </Button>
                </div>
                {data.headings.length > 0 ? (
                  <div className="space-y-3">
                    {data.headings.map((heading, i) => (
                      <div 
                        key={i} 
                        className="bg-gray-50 p-3 rounded-md"
                        style={{ 
                          marginLeft: heading.tag === 'h1' ? '0' : 
                                     heading.tag === 'h2' ? '1rem' :
                                     heading.tag === 'h3' ? '2rem' : 
                                     heading.tag === 'h4' ? '3rem' : 
                                     heading.tag === 'h5' ? '4rem' : '5rem'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{heading.text}</span>
                          <Badge variant="outline" className="text-xs">{heading.tag}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No headings found on this page</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="paragraphs" className="m-0">
            <ScrollArea className="h-[500px] lg:h-[600px]">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">Paragraphs</h3>
                  <Button
                    onClick={() => copyToClipboard(paragraphsText, "Paragraphs")}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                      <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    Copy All
                  </Button>
                </div>
                {data.paragraphs.length > 0 ? (
                  <div className="space-y-3">
                    {data.paragraphs.map((paragraph, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-md text-gray-700">
                        {paragraph}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No paragraphs found on this page</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="links" className="m-0">
            <ScrollArea className="h-[500px] lg:h-[600px]">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">Links</h3>
                  <Button
                    onClick={() => copyToClipboard(linksText, "Links")}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                      <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    Copy All
                  </Button>
                </div>
                {data.links.length > 0 ? (
                  <div className="space-y-3">
                    {data.links.map((link, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="text-gray-700 font-medium">{link.text}</span>
                          <span className="text-blue-500 text-sm break-all">{link.url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No links found on this page</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="lists" className="m-0">
            <ScrollArea className="h-[500px] lg:h-[600px]">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">List Items</h3>
                  <Button
                    onClick={() => copyToClipboard(listItemsText, "List items")}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                      <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.5C11 2.77614 11.2239 3 11.5 3C11.7761 3 12 2.77614 12 2.5V2H11ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.5C4 2.77614 4.22386 3 4.5 3C4.77614 3 5 2.77614 5 2.5V2H10V2.5C10 2.77614 10.2239 3 10.5 3C10.7761 3 11 2.77614 11 2.5V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    Copy All
                  </Button>
                </div>
                {data.listItems.length > 0 ? (
                  <div className="space-y-3">
                    {data.listItems.map((item, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-md text-gray-700">
                        • {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No list items found on this page</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="meta" className="m-0">
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Page Title</h3>
                <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                  {data.title || "No title found"}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Meta Description</h3>
                <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                  {data.metaDescription || "No meta description found"}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Meta Keywords</h3>
                <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                  {data.metaKeywords || "No meta keywords found"}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase">URL</h3>
                <div className="bg-gray-50 p-3 rounded-md text-blue-500 break-all">
                  {data.url}
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
