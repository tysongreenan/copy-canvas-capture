
import React from 'react';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { SitemapNode } from './SitemapNode';
import { SitemapData } from '@/services/ScraperService';

interface SitemapFlowProps {
  nodes: Node[];
  edges: Edge[];
}

const nodeTypes = {
  siteNode: SitemapNode,
};

export const SitemapFlow: React.FC<SitemapFlowProps> = ({ nodes, edges }) => {
  return (
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
  );
};
