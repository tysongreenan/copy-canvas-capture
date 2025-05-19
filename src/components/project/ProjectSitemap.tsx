
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

  // Ensure we have a waterfall layout with homepage at the top
  const organizedSitemapData = organizeSitemapData(sitemapData);

  return (
    <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={organizedSitemapData.nodes as Node[]}
        edges={organizedSitemapData.edges as Edge[]}
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

// Function to organize the sitemap in a waterfall structure
function organizeSitemapData(sitemapData: SitemapData): SitemapData {
  const { nodes, edges } = sitemapData;
  
  // Find the home node (should be the first node or the one with id 'home')
  const homeNodeIndex = nodes.findIndex(node => 
    node.id === 'home' || 
    node.data.path === '/' || 
    node.data.label.toLowerCase().includes('home')
  );
  
  // If we found a home node, make sure it's at the top
  if (homeNodeIndex !== -1) {
    const homeNode = { ...nodes[homeNodeIndex] };
    homeNode.position = { x: 250, y: 0 }; // Position home node at the top center
    
    // Remove the home node from the array
    const otherNodes = [...nodes];
    otherNodes.splice(homeNodeIndex, 1);
    
    // Calculate positions for the rest of the nodes in a waterfall pattern
    const newNodes = [homeNode];
    const levelMap = new Map<string, number>(); // Map to track node levels
    
    // Set initial level for connected nodes from home
    const directChildren = edges
      .filter(edge => edge.source === homeNode.id)
      .map(edge => edge.target);
      
    directChildren.forEach(childId => levelMap.set(childId, 1));
    
    // Calculate levels for all nodes (distance from home node)
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of edges) {
        const sourceLevel = levelMap.get(edge.source);
        if (sourceLevel !== undefined) {
          const targetCurrentLevel = levelMap.get(edge.target);
          const newLevel = sourceLevel + 1;
          
          if (targetCurrentLevel === undefined || newLevel < targetCurrentLevel) {
            levelMap.set(edge.target, newLevel);
            changed = true;
          }
        }
      }
    }
    
    // Group nodes by levels
    const levelGroups = new Map<number, string[]>();
    for (const [nodeId, level] of levelMap.entries()) {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)?.push(nodeId);
    }
    
    // Add nodes that don't have levels (not connected to the home node)
    const unconnectedNodes = otherNodes.filter(node => !levelMap.has(node.id));
    const maxLevel = Math.max(0, ...[...levelMap.values()]);
    unconnectedNodes.forEach(node => {
      const unconnectedLevel = maxLevel + 1;
      if (!levelGroups.has(unconnectedLevel)) {
        levelGroups.set(unconnectedLevel, []);
      }
      levelGroups.get(unconnectedLevel)?.push(node.id);
    });
    
    // Position nodes by level
    const maxNodesPerRow = 5;
    for (let level = 1; level <= Math.max(...levelGroups.keys()); level++) {
      const nodesInLevel = levelGroups.get(level) || [];
      
      nodesInLevel.forEach((nodeId, index) => {
        const nodeInLevel = otherNodes.find(n => n.id === nodeId);
        if (nodeInLevel) {
          const nodeSpacing = 180;
          const rowWidth = Math.min(nodesInLevel.length, maxNodesPerRow) * nodeSpacing;
          const startX = 250 - (rowWidth / 2) + (nodeSpacing / 2);
          
          const row = Math.floor(index / maxNodesPerRow);
          const col = index % maxNodesPerRow;
          
          const node = { ...nodeInLevel };
          node.position = { 
            x: startX + (col * nodeSpacing), 
            y: 120 * level + (row * 80) 
          };
          
          newNodes.push(node);
        }
      });
    }
    
    return {
      nodes: newNodes,
      edges: edges
    };
  }
  
  // If no home node found, return original data
  return sitemapData;
}
