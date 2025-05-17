
import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './sitemap.css';

import { SitemapNode } from './SitemapNode';
import { initialNodes, initialEdges } from './sitemapData';

const nodeTypes = {
  siteNode: SitemapNode,
};

export const SitemapFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
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
