
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Database, Zap } from 'lucide-react';

interface RAGDebuggerProps {
  projectId: string;
}

export function RAGDebugger({ projectId }: RAGDebuggerProps) {
  const [query, setQuery] = useState('the junction');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [embeddingInfo, setEmbeddingInfo] = useState<string>('');
  const [similarity, setSimilarity] = useState(0.25);
  const [quality, setQuality] = useState(0.6);
  const { toast } = useToast();

  const generateEmbedding = async (text: string): Promise<number[] | null> => {
    console.log(`Generating embedding for: "${text}"`);
    try {
      const { data, error } = await supabase.functions.invoke("generate-embedding", {
        body: { text }
      });

      if (error) {
        console.error("Error generating embedding:", error);
        return null;
      }

      if (!data || !data.embedding) {
        console.error("No embedding data returned.");
        return null;
      }

      console.log("Embedding generated successfully");
      return data.embedding;
    } catch (err) {
      console.error("Caught exception:", err);
      return null;
    }
  };

  const searchWithEmbedding = async (queryEmbedding: number[], threshold: number, minQuality: number) => {
    try {
      const { data, error } = await supabase.rpc('match_documents_quality_weighted', {
        query_embedding: queryEmbedding as any,
        match_threshold: threshold,
        match_count: 10,
        p_project_id: projectId,
        p_content_type: null,
        include_global: false,
        p_marketing_domain: null,
        p_complexity_level: null,
        p_min_quality_score: minQuality
      });

      if (error) {
        console.error("Search error:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Search exception:", err);
      return [];
    }
  };

  const runDebugSearch = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      const queryEmbedding = await generateEmbedding(query);
      if (!queryEmbedding) {
        toast({
          title: "Error",
          description: "Failed to generate embedding",
          variant: "destructive"
        });
        return;
      }
      
      const embeddingInfoText = `Dimensions: ${queryEmbedding.length} | First 5 values: [${queryEmbedding.slice(0, 5).map((v: number) => v.toFixed(4)).join(', ')}...]`;
      setEmbeddingInfo(embeddingInfoText);

      const searchResults = await searchWithEmbedding(queryEmbedding, similarity, quality);
      setResults([{ threshold: similarity, count: searchResults.length, results: searchResults }]);

      toast({
        title: "Search Complete",
        description: `Similarity threshold ${similarity}, min quality ${quality}`,
      });

    } catch (error) {
      console.error("Debug search error:", error);
      toast({
        title: "Error",
        description: "Failed to run debug search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} />
          RAG Search Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1"
          />
          <Button onClick={runDebugSearch} disabled={isLoading}>
            <Search size={16} className="mr-2" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={similarity}
            onChange={(e) => setSimilarity(parseFloat(e.target.value))}
            placeholder="Similarity"
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            placeholder="Min Quality"
          />
        </div>

        {embeddingInfo && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Zap size={16} />
              Embedding Info
            </h4>
            <p className="text-xs text-gray-600">{embeddingInfo}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Search Results by Threshold</h4>
            {results.map((thresholdResult, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">
                    Threshold: {thresholdResult.threshold}
                  </Badge>
                  <Badge variant={thresholdResult.count > 0 ? "default" : "secondary"}>
                    {thresholdResult.count} results
                  </Badge>
                </div>
                
                {thresholdResult.results.length > 0 ? (
                  <div className="space-y-2">
                    {thresholdResult.results.slice(0, 3).map((result: any, resultIdx: number) => (
                      <div key={resultIdx} className="border-l-2 border-blue-200 pl-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Similarity: {(result.similarity * 100).toFixed(1)}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Quality: {result.quality_score || 'N/A'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Weighted: {(result.weighted_score * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">
                          {result.content.substring(0, 200)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Source: {result.source_info || 'Unknown'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No results found at this threshold</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
