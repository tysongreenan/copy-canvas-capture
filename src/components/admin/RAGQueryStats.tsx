import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RAGQueryService, ProjectStats } from '@/services/RAGQueryService';
import { supabase } from '@/integrations/supabase/client';

interface StatsByProject {
  project_id: string;
  title: string;
  stats: ProjectStats;
}

export function RAGQueryStats() {
  const [projects, setProjects] = useState<StatsByProject[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('scraped_projects').select('id,title');
      const list = data || [];
      const results: StatsByProject[] = [];
      for (const p of list) {
        const stats = await RAGQueryService.getStats(p.id);
        results.push({ project_id: p.id, title: p.title, stats });
      }
      setProjects(results);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {projects.map(p => (
        <Card key={p.project_id}>
          <CardHeader>
            <CardTitle>{p.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">Average confidence: {p.stats.avg_confidence?.toFixed(2) ?? 'N/A'}</p>
            <ul className="list-disc ml-6 text-sm">
              {p.stats.frequent_queries.map(q => (
                <li key={q.query_text}>{q.query_text} ({q.query_count})</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
