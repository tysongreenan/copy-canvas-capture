
import { SitemapData } from '@/services/ScraperService';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { SitemapNode } from '../sitemap/SitemapNode';

interface ProjectSitemapProps {
  sitemapData?: SitemapData;
}

const nodeTypes = {
  siteNode: SitemapNode,
};

export function ProjectSitemap({ sitemapData }: ProjectSitemapProps) {
  if (!sitemapData || !sitemapData.nodes || sitemapData.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">
        <p>No sitemap data available for this project</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={sitemapData.nodes as Node[]}
        edges={sitemapData.edges as Edge[]}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
