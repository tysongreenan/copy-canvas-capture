import { useState, useEffect } from "react";
import { ScrapedContent } from "@/services/ScraperTypes";
import { ContentService } from "@/services/ContentService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  FileText, 
  List, 
  Heading1, 
  Heading2, 
  Heading3, 
  ChevronDown, 
  ChevronUp,
  Search,
  FileBarChart,
  Edit,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentDisplay } from "@/components/ContentDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface SEOContentSummaryProps {
  projectId: string;
}

// This maps the database content to the ScrapedContent format
const mapDatabaseToScrapedContent = (dbContent: any): ScrapedContent => {
  const content = dbContent.content;
  
  return {
    url: dbContent.url,
    title: dbContent.title || "Untitled",
    headings: Array.isArray(content?.headings) ? content.headings : [],
    paragraphs: Array.isArray(content?.paragraphs) ? content.paragraphs : [],
    links: Array.isArray(content?.links) ? content.links : [],
    listItems: Array.isArray(content?.listItems) ? content.listItems : [],
    metaDescription: content?.metaDescription || null,
    metaKeywords: content?.metaKeywords || null,
    projectId: dbContent.project_id
  };
};

export function SEOContentSummary({ projectId }: SEOContentSummaryProps) {
  const [pages, setPages] = useState<ScrapedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [keywordInfo, setKeywordInfo] = useState<{keyword: string, count: number}[]>([]);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPageForContent, setSelectedPageForContent] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchPages = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        const projectPages = await ContentService.getProjectPages(projectId);
        // Map the database format to ScrapedContent format
        const mappedPages = projectPages.map(mapDatabaseToScrapedContent);
        setPages(mappedPages);
        
        if (mappedPages.length > 0) {
          setSelectedPageForContent(mappedPages[0].url);
        }
        
        // Calculate total word count
        let wordCount = 0;
        const keywordMap = new Map<string, number>();
        
        mappedPages.forEach(page => {
          // Add words from paragraphs
          if (page.paragraphs) {
            page.paragraphs.forEach(paragraph => {
              const words = paragraph.split(/\s+/).filter(Boolean);
              wordCount += words.length;
              
              // Process keywords (simple implementation - words that appear multiple times)
              words.forEach(word => {
                const processedWord = word.toLowerCase().replace(/[^\w\s]|_/g, "").trim();
                if (processedWord.length > 3) { // Ignore small words
                  keywordMap.set(processedWord, (keywordMap.get(processedWord) || 0) + 1);
                }
              });
            });
          }
        });
        
        setTotalWordCount(wordCount);
        
        // Get top keywords
        const sortedKeywords = Array.from(keywordMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([keyword, count]) => ({ keyword, count }));
        
        setKeywordInfo(sortedKeywords);
      } catch (error) {
        console.error("Error fetching project pages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPages();
  }, [projectId]);
  
  const togglePageExpand = (url: string) => {
    if (expandedPage === url) {
      setExpandedPage(null);
    } else {
      setExpandedPage(url);
    }
  };
  
  const handleCopyFullContent = () => {
    const selectedPage = pages.find(page => page.url === selectedPageForContent);
    if (!selectedPage) return;
    
    const content = selectedPage.paragraphs.join('\n\n');
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "All content copied successfully",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy content to clipboard",
          variant: "destructive",
        });
      });
  };
  
  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No content available</h3>
            <p className="text-sm text-gray-500 mt-2">
              There's no scraped content for this project yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getHeadingIcon = (tag: string) => {
    switch (tag) {
      case 'h1': return <Heading1 className="h-4 w-4" />;
      case 'h2': return <Heading2 className="h-4 w-4" />;
      case 'h3': return <Heading3 className="h-4 w-4" />;
      default: return <Heading3 className="h-4 w-4" />;
    }
  };
  
  const selectedPageContent = pages.find(page => page.url === selectedPageForContent);
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <FileBarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Content Structure
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Keyword Analysis
          </TabsTrigger>
          <TabsTrigger value="fullcontent" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            Full Content
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Content Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Pages</div>
                  <div className="mt-1 text-2xl font-semibold">{pages.length}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Total Word Count</div>
                  <div className="mt-1 text-2xl font-semibold">{totalWordCount.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Meta Descriptions</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {pages.filter(page => page.metaDescription).length}/{pages.length}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">SEO Health Score</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Meta Descriptions</span>
                      <span className="text-sm font-medium">
                        {Math.round((pages.filter(page => page.metaDescription).length / pages.length) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(pages.filter(page => page.metaDescription).length / pages.length) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Heading Structure</span>
                      <span className="text-sm font-medium">
                        {Math.round((pages.filter(page => page.headings && page.headings.length > 0).length / pages.length) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(pages.filter(page => page.headings && page.headings.length > 0).length / pages.length) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Content Length</span>
                      <span className="text-sm font-medium">
                        {pages.length > 0 ? Math.round((totalWordCount / pages.length) / 10) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={pages.length > 0 ? Math.min(100, (totalWordCount / pages.length) / 10) : 0} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Page Meta Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.slice(0, 5).map((page, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{page.title}</h3>
                      <a 
                        href={page.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </div>
                    
                    <p className="text-sm mt-2 text-gray-600 italic">
                      {page.metaDescription || "No meta description available"}
                    </p>
                    
                    {page.headings && page.headings.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Main Headings:</div>
                        <div className="flex flex-wrap gap-1">
                          {page.headings
                            .filter(h => h.tag === 'h1' || h.tag === 'h2')
                            .slice(0, 3)
                            .map((heading, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-100 flex items-center gap-1">
                                {getHeadingIcon(heading.tag)}
                                {heading.text.substring(0, 30)}
                                {heading.text.length > 30 ? '...' : ''}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {pages.length > 5 && (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Showing 5 of {pages.length} pages
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Website Content Structure</CardTitle>
              <CardDescription>
                View the complete content structure of your website including headings, paragraphs, and links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pages.map((page, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div 
                      className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer"
                      onClick={() => togglePageExpand(page.url)}
                    >
                      <div>
                        <h3 className="font-medium">{page.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{page.url}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        {expandedPage === page.url ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {expandedPage === page.url && (
                      <div className="p-4 border-t space-y-4">
                        {/* Meta Information */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Meta Information</h4>
                          <div className="bg-slate-50 p-3 rounded text-sm">
                            <div className="mb-2">
                              <span className="font-medium">Title:</span> {page.title}
                            </div>
                            <div className="mb-2">
                              <span className="font-medium">Meta Description:</span> {page.metaDescription || "None"}
                            </div>
                            <div>
                              <span className="font-medium">Meta Keywords:</span> {page.metaKeywords || "None"}
                            </div>
                          </div>
                        </div>
                        
                        {/* Headings Structure */}
                        {page.headings && page.headings.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Heading Structure</h4>
                            <div className="space-y-2">
                              {page.headings.map((heading, i) => (
                                <div key={i} className={`flex items-start gap-2 ${
                                  heading.tag === 'h1' ? 'ml-0 font-bold' : 
                                  heading.tag === 'h2' ? 'ml-4 font-semibold' : 
                                  heading.tag === 'h3' ? 'ml-8' : 
                                  heading.tag === 'h4' ? 'ml-12 text-sm' : 'ml-16 text-sm'
                                }`}>
                                  {getHeadingIcon(heading.tag)}
                                  <span>{heading.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Content Preview */}
                        {page.paragraphs && page.paragraphs.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Content Preview</h4>
                            <div className="bg-slate-50 p-3 rounded text-sm max-h-64 overflow-y-auto">
                              {page.paragraphs.slice(0, 3).map((paragraph, i) => (
                                <p key={i} className="mb-2">{paragraph}</p>
                              ))}
                              {page.paragraphs.length > 3 && (
                                <div className="text-blue-600 text-sm font-medium mt-2">
                                  + {page.paragraphs.length - 3} more paragraphs
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Links */}
                        {page.links && page.links.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Links ({page.links.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {page.links.slice(0, 6).map((link, i) => (
                                <div key={i} className="flex items-center gap-1 text-sm overflow-hidden">
                                  <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-500" />
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 truncate"
                                    title={link.text || link.url}
                                  >
                                    {link.text || link.url}
                                  </a>
                                </div>
                              ))}
                              {page.links.length > 6 && (
                                <div className="text-blue-600 text-sm font-medium">
                                  + {page.links.length - 6} more links
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords">
          {keywordInfo.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Keyword Analysis</CardTitle>
                <CardDescription>
                  The most frequently used keywords across your website content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {keywordInfo.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.keyword}</span>
                        <span className="text-sm text-gray-500">{item.count} occurrences</span>
                      </div>
                      <Progress
                        value={(item.count / keywordInfo[0].count) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-slate-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">SEO Recommendations</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      Ensure your primary keywords appear in H1 headings
                    </li>
                    <li className="flex gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      Include keywords naturally in your content
                    </li>
                    <li className="flex gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      Add meta descriptions for all pages
                    </li>
                    <li className="flex gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      Use semantic HTML for better structure
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No keyword data available</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Unable to analyze keywords from the available content.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="fullcontent">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Full Website Content</CardTitle>
              <CardDescription>
                View and edit the complete content from each page of your website. Use this to improve your copy and SEO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="w-full md:w-3/4">
                  <label className="text-sm font-medium mb-2 block">Select Page to View</label>
                  <Select
                    value={selectedPageForContent || ''}
                    onValueChange={(value) => setSelectedPageForContent(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((page, index) => (
                        <SelectItem key={index} value={page.url}>
                          {page.title || page.url}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleCopyFullContent}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy All Content
                  </Button>
                </div>
              </div>
              
              {selectedPageContent && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b">
                    <h3 className="font-medium">{selectedPageContent.title}</h3>
                    <a 
                      href={selectedPageContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm mt-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {selectedPageContent.url}
                    </a>
                  </div>
                  
                  <div className="p-4">
                    <ContentDisplay data={selectedPageContent} />
                  </div>
                </div>
              )}
              
              <Card className="mt-6 bg-slate-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SEO Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPageContent && (
                    <div className="space-y-4">
                      {!selectedPageContent.metaDescription && (
                        <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                          <h4 className="font-medium text-yellow-800">Missing Meta Description</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Add a meta description to improve search engine visibility. Keep it between 120-155 characters.
                          </p>
                        </div>
                      )}
                      
                      {selectedPageContent.headings.filter(h => h.tag === 'h1').length === 0 && (
                        <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                          <h4 className="font-medium text-yellow-800">Missing H1 Heading</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Add an H1 heading that includes your primary keyword to improve page structure.
                          </p>
                        </div>
                      )}
                      
                      {selectedPageContent.paragraphs.length > 0 && 
                        selectedPageContent.paragraphs.join(' ').split(' ').length < 300 && (
                        <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                          <h4 className="font-medium text-yellow-800">Thin Content</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            This page has less than 300 words. Consider adding more meaningful content for better SEO.
                          </p>
                        </div>
                      )}
                      
                      <div className="p-3 border border-green-200 bg-green-50 rounded-md">
                        <h4 className="font-medium text-green-800">Keyword Optimization</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Ensure your target keywords appear in headers, the first paragraph, and throughout the content.
                        </p>
                      </div>
                      
                      <div className="p-3 border border-green-200 bg-green-50 rounded-md">
                        <h4 className="font-medium text-green-800">Internal Linking</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Add relevant internal links to other pages on your website to improve navigation and SEO.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
