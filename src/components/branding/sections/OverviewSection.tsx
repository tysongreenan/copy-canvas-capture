import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/chat/FileUpload";
import { ContentService } from "@/services/ContentService";
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
  ExternalLink
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
      description: "Your document has been imported and embedded",
    });
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
                  <h3 className="text-lg font-medium mb-2">Import Documents</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload files to add them to your knowledge base. Supported formats: PDF, DOCX, TXT, MD
                  </p>
                </div>
                
                <FileUpload 
                  projectId={projectId} 
                  onSuccess={handleImportSuccess}
                />
                
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">
                    <strong>Note:</strong> All uploaded documents are automatically processed and embedded for AI search. 
                    You can also import content from the project's Import tab for more options.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 