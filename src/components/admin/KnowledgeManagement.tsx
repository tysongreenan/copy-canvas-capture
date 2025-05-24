
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Upload, Search, BookOpen } from "lucide-react";
import { GlobalKnowledgeService, GlobalKnowledge, KnowledgeSource } from "@/services/GlobalKnowledgeService";
import { KnowledgeIngestionService } from "@/services/KnowledgeIngestionService";
import { useToast } from "@/hooks/use-toast";

export function KnowledgeManagement() {
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalKnowledge[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadKnowledgeSources();
  }, []);

  const loadKnowledgeSources = async () => {
    const sources = await GlobalKnowledgeService.getKnowledgeSources();
    setKnowledgeSources(sources);
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
    if (!searchTerm.trim()) return;
    
    const results = await GlobalKnowledgeService.searchKnowledge();
    setSearchResults(results);
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

      {/* Knowledge Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Knowledge Base
          </CardTitle>
          <CardDescription>
            Search through the marketing knowledge to see what's available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search marketing knowledge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Search Results ({searchResults.length})</h4>
              {searchResults.map((knowledge) => (
                <Card key={knowledge.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium">{knowledge.title || "Untitled"}</h5>
                      <Badge className={getContentTypeColor(knowledge.content_type)}>
                        {knowledge.content_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{knowledge.content}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{knowledge.source}</Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
