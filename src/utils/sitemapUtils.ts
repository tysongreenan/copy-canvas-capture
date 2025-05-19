import { ReactNode } from 'react';
import { SitemapData, SitemapNode, SitemapEdge } from '@/services/ScraperTypes';
import { Edge, Node } from 'reactflow';

// Update the interface to match what reactflow expects
export interface ReactFlowSitemapNode extends Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    icon?: ReactNode;
    path: string;
    handles: string[];
    description?: string;
    url: string;
  };
}

// Convert SitemapData to ReactFlow compatible format
export const convertSitemapToReactFlow = (sitemapData: SitemapData | undefined): { nodes: Node[], edges: Edge[] } => {
  if (!sitemapData) {
    return { nodes: [], edges: [] };
  }
  
  const nodes: Node[] = sitemapData.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data
  }));
  
  const edges: Edge[] = sitemapData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.animated,
    style: edge.style ? { stroke: edge.style.stroke } : undefined
  }));
  
  return { nodes, edges };
};
