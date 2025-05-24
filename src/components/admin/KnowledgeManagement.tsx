
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, Trash2, Edit } from "lucide-react";
import { GlobalKnowledgeService, GlobalKnowledge, KnowledgeSource } from "@/services/GlobalKnowledgeService";
import { KnowledgeIngestionService } from "@/services/KnowledgeIngestionService";
import { useToast } from "@/hooks/use-toast";
import { FileUploadCard } from "./FileUploadCard";
import { ManualKnowledgeEntry } from "./ManualKnowledgeEntry";
import { KnowledgeFilters } from "./KnowledgeFilters";

export function KnowledgeManagement() {
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalKnowledge[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("");
  const [marketingDomain, setMarketingDomain] = useState("");
  const [complexityLevel, setComplexityLevel] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadKnowledgeSources();
    loadAllKnowledge();
  }, []);

  const loadKnowledgeSources = async () => {
    const sources = await GlobalKnowledgeService.getKnowledgeSources();
    setKnowledgeSources(sources);
  };

  const loadAllKnowledge = async () => {
    const results = await GlobalKnowledgeService.searchKnowledge();
    setSearchResults(results);
  };

  const handleIngestKnowledge = async () => {
    setIsIngesting(true);
    try {
      const success = await KnowledgeIngestionService.ingestMarketingKnowledge();
      if (success) {
        toast({
          title: "Knowledge Ingested",
          description: "Marketing knowledge base has been updated with new content"
        });
        await loadKnowledgeSources();
        await loadAllKnowledge();
      } else {
        toast({
          title: "Ingestion Failed", 
          description: "Some knowledge ingestion failed. Check logs for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Knowledge ingestion error:", error);
      toast({
        title: "Error",
        description: "Failed to ingest knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSearch = async () => {
    const results = await GlobalKnowledgeService.searchKnowledge(
      contentType || undefined,
      marketingDomain || undefined,
      complexityLevel || undefined,
      searchTerm ? [searchTerm] : undefined
    );
    setSearchResults(results);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setContentType("");
    setMarketingDomain("");
    setComplexityLevel("");
    loadAllKnowledge();
  };

  const handleUploadComplete = () => {
    loadAllKnowledge();
    toast({
      title: "Upload Complete",
      description: "Files have been processed and added to the knowledge base"
    });
  };

  const handleEntryComplete = () => {
    loadAllKnowledge();
  };

  const getContentTypeColor = (contentType: string) => {
    const colors = {
      'principle': 'bg-blue-100 text-blue-800',
      'framework': 'bg-green-100 text-green-800', 
      'example': 'bg-yellow-100 text-yellow-800',
      'guide': 'bg-purple-100 text-purple-800',
      'case_study': 'bg-red-100 text-red-800'
    };
    return colors[contentType] || 'bg-gray-100 text-gray-800';
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      'copywriting': 'bg-orange-100 text-orange-800',
      'branding': 'bg-pink-100 text-pink-800',
      'email-marketing': 'bg-indigo-100 text-indigo-800',
      'general-marketing': 'bg-teal-100 text-teal-800'
    };
    return colors[domain] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Knowledge Base</h2>
          <p className="text-gray-600">Manage shared marketing knowledge that powers all agents</p>
        </div>
        <Button 
          onClick={handleIngestKnowledge} 
          disabled={isIngesting}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isIngesting ? "Ingesting..." : "Ingest Marketing Knowledge"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="browse">Browse & Search</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Knowledge Sources Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Sources
              </CardTitle>
              <CardDescription>
                Authoritative marketing resources powering the knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgeSources.map((source) => (
                  <Card key={source.id} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{source.name}</h4>
                      {source.author && (
                        <p className="text-sm text-gray-600">by {source.author}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{source.source_type}</Badge>
                        <Badge 
                          variant="secondary"
                          className={`${source.authority_score > 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          Authority: {(source.authority_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      {source.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{source.description}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{searchResults.length}</div>
                <div className="text-sm text-gray-600">Total Knowledge Entries</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{knowledgeSources.length}</div>
                <div className="text-sm text-gray-600">Knowledge Sources</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {searchResults.filter(k => k.content_type === 'principle').length}
                </div>
                <div className="text-sm text-gray-600">Principles</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {searchResults.filter(k => k.content_type === 'framework').length}
                </div>
                <div className="text-sm text-gray-600">Frameworks</div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <FileUploadCard onUploadComplete={handleUploadComplete} />
        </TabsContent>

        <TabsContent value="manual">
          <ManualKnowledgeEntry onEntryComplete={handleEntryComplete} />
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <KnowledgeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            contentType={contentType}
            setContentType={setContentType}
            marketingDomain={marketingDomain}
            setMarketingDomain={setMarketingDomain}
            complexityLevel={complexityLevel}
            setComplexityLevel={setComplexityLevel}
            onSearch={handleSearch}
            onClear={handleClearFilters}
          />

          {/* Knowledge Results */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Entries ({searchResults.length})</CardTitle>
              <CardDescription>
                Browse and manage all knowledge entries in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((knowledge) => (
                    <Card key={knowledge.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium text-lg">{knowledge.title || "Untitled"}</h5>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{knowledge.content}</p>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <Badge variant="outline">{knowledge.source}</Badge>
                          <Badge className={getContentTypeColor(knowledge.content_type)}>
                            {knowledge.content_type}
                          </Badge>
                          <Badge className={getDomainColor(knowledge.marketing_domain)}>
                            {knowledge.marketing_domain}
                          </Badge>
                          <Badge variant="secondary">{knowledge.complexity_level}</Badge>
                          <span className="text-gray-500">
                            Quality: {(knowledge.quality_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        {knowledge.tags && knowledge.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {knowledge.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No knowledge entries found. Try adjusting your filters or add some content.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
