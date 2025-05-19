
import { ReactFlow, MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { SitemapNode } from './SitemapNode';
import { SitemapData } from '@/services/ScraperTypes';

interface ProjectSitemapFlowProps {
  nodes: any[];
  edges: any[];
}

const nodeTypes = {
  siteNode: SitemapNode,
};

export function ProjectSitemapFlow({ nodes, edges }: ProjectSitemapFlowProps) {
  return (
    <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
