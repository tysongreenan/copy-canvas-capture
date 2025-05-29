import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/chat/FileUpload";
import { ContentService } from "@/services/ContentService";
import { YouTubeService } from "@/services/YouTubeService";
import { ResearchService } from "@/services/ResearchService";
import { ScraperService } from "@/services/ScraperService";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  Calendar, 
  Globe, 
  Youtube, 
  Search,
  BarChart3,
  BookOpen,
  Database,
  Eye,
  ExternalLink,
  Plus,
  Users,
  Type,
  Link as LinkIcon
} from "lucide-react";

interface OverviewSectionProps {
  projectId: string;
  project: any;
}

interface EmbeddedDocument {
  id: string;
  title: string;
  url: string;
  created_at: string;
  content: {
    paragraphs?: string[];
    headings?: Array<{text: string, tag: string}>;
    meta_description?: string;
  };
  content_type?: string;
}

export function OverviewSection({ projectId, project }: OverviewSectionProps) {
  const [documents, setDocuments] = useState<EmbeddedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    websitePages: 0,
    uploadedFiles: 0,
    youtubeVideos: 0,
    researchReports: 0,
    totalWordCount: 0
  });

  // Import form states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [researchKeyword, setResearchKeyword] = useState('');
  const [competitorName, setCompetitorName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [processingState, setProcessingState] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchProjectDocuments();
  }, [projectId]);

  const fetchProjectDocuments = async () => {
    try {
      setLoading(true);
      const projectPages = await ContentService.getProjectPages(projectId);
      
      if (projectPages) {
        const mappedDocuments: EmbeddedDocument[] = projectPages.map(page => ({
          id: page.id,
          title: page.title,
          url: page.url,
          created_at: page.created_at,
          content: page.content as {
            paragraphs?: string[];
            headings?: Array<{text: string, tag: string}>;
            meta_description?: string;
          },
          content_type: getContentType(page.url)
        }));

        setDocuments(mappedDocuments);
        
        // Calculate stats
        const stats = {
          totalDocuments: mappedDocuments.length,
          websitePages: mappedDocuments.filter(doc => 
            doc.url.startsWith('http') && 
            !doc.url.includes('youtube.com') && 
            !doc.url.startsWith('file:') && 
            !doc.url.startsWith('research:')
          ).length,
          uploadedFiles: mappedDocuments.filter(doc => doc.url.startsWith('file:')).length,
          youtubeVideos: mappedDocuments.filter(doc => doc.url.includes('youtube.com')).length,
          researchReports: mappedDocuments.filter(doc => doc.url.startsWith('research:')).length,
          totalWordCount: mappedDocuments.reduce((total, doc) => {
            const paragraphs = doc.content?.paragraphs || [];
            const wordCount = paragraphs.reduce((count, paragraph) => {
              return count + paragraph.split(/\s+/).length;
            }, 0);
            return total + wordCount;
          }, 0)
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching project documents:", error);
      toast({
        title: "Error",
        description: "Failed to load project documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentType = (url: string): string => {
    if (url.startsWith('file:')) return 'uploaded_file';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube_video';
    if (url.startsWith('research:')) return 'research_report';
    if (url.startsWith('text:')) return 'pasted_text';
    return 'website_page';
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'uploaded_file':
        return <FileText className="h-4 w-4" />;
      case 'youtube_video':
        return <Youtube className="h-4 w-4" />;
      case 'research_report':
        return <Search className="h-4 w-4" />;
      case 'pasted_text':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string): string => {
    switch (type) {
      case 'uploaded_file':
        return 'File Upload';
      case 'youtube_video':
        return 'YouTube Video';
      case 'research_report':
        return 'Research Report';
      case 'pasted_text':
        return 'Pasted Text';
      default:
        return 'Website Page';
    }
  };

  const formatWordCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleImportSuccess = () => {
    fetchProjectDocuments(); // Refresh the documents list
    toast({
      title: "Import successful",
      description: "Your content has been imported and embedded",
    });
  };

  // YouTube video processing
  const handleYouTubeImport = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    // Validate YouTube URL
    if (!YouTubeService.isValidYouTubeUrl(youtubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL (videos, shorts, or embedded)",
        variant: "destructive"
      });
      return;
    }

    setProcessingState(prev => ({ ...prev, youtube: true }));
    try {
      const result = await YouTubeService.processVideo(youtubeUrl, projectId);
      if (result.success) {
        const transcriptStatus = result.hasTranscript 
          ? "with full transcript" 
          : "with video metadata (no transcript available)";
        
        toast({
          title: "YouTube Video Processed",
          description: `Successfully processed "${result.title || 'video'}" ${transcriptStatus}. Generated ${result.embeddingsGenerated} embeddings.`,
        });
        setYoutubeUrl('');
        handleImportSuccess();
      } else {
        toast({
          title: "Processing Failed",
          description: result.message || "Failed to process YouTube video",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process YouTube video",
        variant: "destructive"
      });
    } finally {
      setProcessingState(prev => ({ ...prev, youtube: false }));
    }
  };

  // Website scraping
  const handleWebsiteImport = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a website URL",
        variant: "destructive"
      });
      return;
    }

    setProcessingState(prev => ({ ...prev, website: true }));
    try {
      const result = await ScraperService.scrapeWebsite(websiteUrl, {
        crawlEntireSite: false,
        maxPages: 1,
        generateEmbeddings: true,
        useExistingProjectId: projectId
      });

      if (result) {
        toast({
          title: "Website Scraped",
          description: "Successfully scraped and embedded website content",
        });
        setWebsiteUrl('');
        handleImportSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape website",
        variant: "destructive"
      });
    } finally {
      setProcessingState(prev => ({ ...prev, website: false }));
    }
  };

  // Research processing
  const handleResearchImport = async () => {
    if (!researchKeyword.trim()) {
      toast({
        title: "Missing Keyword",
        description: "Please enter a research keyword",
        variant: "destructive"
      });
      return;
    }

    setProcessingState(prev => ({ ...prev, research: true }));
    try {
      const result = await ResearchService.conductResearch(researchKeyword, projectId);
      if (result.success) {
        toast({
          title: "Research Completed",
          description: `Successfully researched "${researchKeyword}" with ${result.embeddingsGenerated} embeddings`,
        });
        setResearchKeyword('');
        handleImportSuccess();
      } else {
        toast({
          title: "Research Failed",
          description: result.message || "Failed to conduct research",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to conduct research",
        variant: "destructive"
      });
    } finally {
      setProcessingState(prev => ({ ...prev, research: false }));
    }
  };

  // Competitor analysis
  const handleCompetitorImport = async () => {
    if (!competitorName.trim()) {
      toast({
        title: "Missing Competitor",
        description: "Please enter a competitor name",
        variant: "destructive"
      });
      return;
    }

    setProcessingState(prev => ({ ...prev, competitor: true }));
    try {
      const result = await ResearchService.researchCompetitor(competitorName, projectId);
      if (result.success) {
        toast({
          title: "Competitor Analysis Complete",
          description: `Successfully analyzed "${competitorName}" with ${result.embeddingsGenerated} embeddings`,
        });
        setCompetitorName('');
        handleImportSuccess();
      } else {
        toast({
          title: "Analysis Failed",
          description: result.message || "Failed to analyze competitor",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze competitor",
        variant: "destructive"
      });
    } finally {
      setProcessingState(prev => ({ ...prev, competitor: false }));
    }
  };

  // Text content import
  const handleTextImport = async () => {
    if (!textContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter some text content",
        variant: "destructive"
      });
      return;
    }

    setProcessingState(prev => ({ ...prev, text: true }));
    try {
      const textContentObj = {
        url: `text://${new Date().getTime()}`,
        title: `Pasted Text ${new Date().toLocaleDateString()}`,
        headings: [],
        paragraphs: textContent.split(/\n+/).filter(p => p.trim().length > 0),
        links: [],
        listItems: [],
        metaDescription: null,
        metaKeywords: null,
        projectId: projectId
      };

      await ContentService.saveContent(textContentObj);
      toast({
        title: "Text Imported",
        description: "Your text has been added to the knowledge base",
      });
      setTextContent('');
      handleImportSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import text content",
        variant: "destructive"
      });
    } finally {
      setProcessingState(prev => ({ ...prev, text: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Overview</h2>
        <p className="text-gray-600">Manage your embedded documents and knowledge base</p>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                <p className="text-xs text-gray-500">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.websitePages}</p>
                <p className="text-xs text-gray-500">Website Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.uploadedFiles}</p>
                <p className="text-xs text-gray-500">Uploaded Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{formatWordCount(stats.totalWordCount)}</p>
                <p className="text-xs text-gray-500">Total Words</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Management */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>
            All embedded documents that power your AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Documents
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import New
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="mt-6">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No documents yet</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Import documents to start building your knowledge base
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getContentTypeIcon(doc.content_type || 'website_page')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium truncate">
                                  {doc.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {getContentTypeLabel(doc.content_type || 'website_page')}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(doc.created_at).toLocaleDateString()}
                              </div>
                              
                              {doc.content?.meta_description && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {doc.content.meta_description}
                                </p>
                              )}
                              
                              {!doc.content?.meta_description && doc.content?.paragraphs && doc.content.paragraphs.length > 0 && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {doc.content.paragraphs[0].substring(0, 150)}...
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {doc.url.startsWith('http') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="import" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Add Knowledge to Vector Database</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose from multiple ways to expand your AI knowledge base. All content is automatically processed and embedded.
                  </p>
                </div>
                
                {/* Import Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* File Upload */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-base">Upload Files</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        PDF, DOCX, TXT, MD files
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileUpload 
                        projectId={projectId} 
                        onSuccess={handleImportSuccess}
                      />
                    </CardContent>
                  </Card>

                  {/* YouTube Videos */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-base">YouTube Videos</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        Extract transcripts from videos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleYouTubeImport()}
                      />
                      <Button 
                        onClick={handleYouTubeImport}
                        disabled={processingState.youtube}
                        className="w-full"
                        size="sm"
                      >
                        {processingState.youtube ? "Processing..." : "Process Video"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Website Scraping */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">Website Pages</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        Scrape content from any website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleWebsiteImport()}
                      />
                      <Button 
                        onClick={handleWebsiteImport}
                        disabled={processingState.website}
                        className="w-full"
                        size="sm"
                      >
                        {processingState.website ? "Scraping..." : "Scrape Page"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Research Keywords */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-base">Research Topics</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        AI-powered deep research reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="e.g., email marketing best practices"
                        value={researchKeyword}
                        onChange={(e) => setResearchKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleResearchImport()}
                      />
                      <Button 
                        onClick={handleResearchImport}
                        disabled={processingState.research}
                        className="w-full"
                        size="sm"
                      >
                        {processingState.research ? "Researching..." : "Conduct Research"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Competitor Analysis */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-base">Competitor Analysis</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        Analyze competitor strategies
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="e.g., Mailchimp or competitor.com"
                        value={competitorName}
                        onChange={(e) => setCompetitorName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleCompetitorImport()}
                      />
                      <Button 
                        onClick={handleCompetitorImport}
                        disabled={processingState.competitor}
                        className="w-full"
                        size="sm"
                      >
                        {processingState.competitor ? "Analyzing..." : "Analyze Competitor"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Text Content */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Type className="h-5 w-5 text-orange-600" />
                        <CardTitle className="text-base">Paste Text</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        Add text content directly
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        placeholder="Paste your text content here..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button 
                        onClick={handleTextImport}
                        disabled={processingState.text}
                        className="w-full"
                        size="sm"
                      >
                        {processingState.text ? "Importing..." : "Import Text"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• All content is automatically chunked and embedded for AI search</li>
                      <li>• YouTube videos extract transcripts for searchable content</li>
                      <li>• Research generates comprehensive reports with current insights</li>
                      <li>• Competitor analysis provides strategic intelligence</li>
                      <li>• Use the project's Import tab for bulk operations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 