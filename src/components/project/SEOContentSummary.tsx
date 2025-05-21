
import { useState, useEffect } from "react";
import { ScrapedContent } from "@/services/ScraperTypes";
import { ContentService } from "@/services/ContentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, FileText, List } from "lucide-react";

interface SEOContentSummaryProps {
  projectId: string;
}

export function SEOContentSummary({ projectId }: SEOContentSummaryProps) {
  const [pages, setPages] = useState<ScrapedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [keywordInfo, setKeywordInfo] = useState<{keyword: string, count: number}[]>([]);
  
  useEffect(() => {
    const fetchPages = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        const projectPages = await ContentService.getProjectPages(projectId);
        setPages(projectPages);
        
        // Calculate total word count
        let wordCount = 0;
        const keywordMap = new Map<string, number>();
        
        projectPages.forEach(page => {
          // Add words from paragraphs
          if (page.content.paragraphs) {
            page.content.paragraphs.forEach(paragraph => {
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
  
  return (
    <div className="space-y-6">
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
                {pages.filter(page => page.content.metaDescription).length}/{pages.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Page Meta Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.slice(0, 5).map((page, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between">
                  <h3 className="font-medium">{page.title || "Untitled Page"}</h3>
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
                  {page.content.metaDescription || "No meta description available"}
                </p>
                
                {page.content.headings && page.content.headings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Main Headings:</div>
                    <div className="flex flex-wrap gap-1">
                      {page.content.headings
                        .filter(h => h.tag === 'h1' || h.tag === 'h2')
                        .slice(0, 3)
                        .map((heading, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-100">
                            {heading.tag.toUpperCase()}: {heading.text.substring(0, 30)}
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
      
      {keywordInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Keyword Analysis</CardTitle>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
