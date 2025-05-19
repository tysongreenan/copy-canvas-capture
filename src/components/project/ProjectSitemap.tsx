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

  // Ensure we have a waterfall layout with homepage at the top and simplified connections
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

// Function to organize the sitemap in a waterfall structure with simplified connections
function organizeSitemapData(sitemapData: SitemapData): SitemapData {
  const { nodes, edges } = sitemapData;
  
  // Find the home node (should be the first node or the one with id 'home')
  const homeNodeIndex = nodes.findIndex(node => 
    node.id === 'home' || 
    node.data.path === '/' || 
    node.data.label.toLowerCase().includes('home') ||
    // Make sure that the crawl URL (which should be the project start URL) is always at the top
    node.id === 'main' || 
    node.data.url === sitemapData.nodes[0]?.data.url
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
    
    // Simplify edges - only keep parent-child relationships rather than all cross-connections
    const simplifiedEdges = [];
    
    // Add connections from home to first level
    for (const nodeId of levelGroups.get(1) || []) {
      simplifiedEdges.push({
        id: `${homeNode.id}-${nodeId}`,
        source: homeNode.id,
        target: nodeId,
        animated: false,
        style: { stroke: '#3b82f6' }
      });
    }
    
    // For each level, connect nodes to the next level based on parent-child relationships
    // but limit cross-connections to reduce visual clutter
    for (let level = 1; level < Math.max(...levelGroups.keys()); level++) {
      const currentLevelNodes = levelGroups.get(level) || [];
      const nextLevelNodes = levelGroups.get(level + 1) || [];
      
      if (nextLevelNodes.length === 0) continue;
      
      // Find actual connections between these levels in the original edges
      const levelConnections = edges.filter(edge => 
        currentLevelNodes.includes(edge.source) && 
        nextLevelNodes.includes(edge.target)
      );
      
      // If there are actual connections, use them (but limit)
      if (levelConnections.length > 0) {
        // Group connections by source node to limit outgoing connections
        const sourceConnections = new Map<string, string[]>();
        
        levelConnections.forEach(edge => {
          if (!sourceConnections.has(edge.source)) {
            sourceConnections.set(edge.source, []);
          }
          sourceConnections.get(edge.source)?.push(edge.target);
        });
        
        // Limit connections per source node to reduce clutter
        sourceConnections.forEach((targets, source) => {
          // Keep only up to 3 connections per source node
          const limitedTargets = targets.slice(0, 3);
          
          limitedTargets.forEach(target => {
            simplifiedEdges.push({
              id: `${source}-${target}`,
              source,
              target,
              animated: false,
              style: { stroke: '#3b82f6' }
            });
          });
        });
      } else {
        // If no actual connections found, create some logical ones to maintain hierarchy
        // Connect each node in current level to at least one node in next level if possible
        currentLevelNodes.forEach((sourceId, idx) => {
          // Distribute connections evenly - connect each source to target at same relative position
          const targetIdx = Math.min(
            Math.floor(idx * (nextLevelNodes.length / currentLevelNodes.length)),
            nextLevelNodes.length - 1
          );
          
          simplifiedEdges.push({
            id: `${sourceId}-${nextLevelNodes[targetIdx]}`,
            source: sourceId,
            target: nextLevelNodes[targetIdx],
            animated: false,
            style: { stroke: '#94a3b8' } // lighter color for inferred connections
          });
        });
      }
    }
    
    return {
      nodes: newNodes,
      edges: simplifiedEdges
    };
  }
  
  // If no home node found, return original data with reduced edges
  return {
    nodes: sitemapData.nodes,
    edges: simplifyEdges(sitemapData.edges)
  };
}

// Helper function to reduce the number of edges to prevent visual clutter
function simplifyEdges(edges: any[]): any[] {
  // Group edges by source
  const edgesBySource = new Map<string, any[]>();
  
  edges.forEach(edge => {
    if (!edgesBySource.has(edge.source)) {
      edgesBySource.set(edge.source, []);
    }
    edgesBySource.get(edge.source)?.push(edge);
  });
  
  // Keep only a limited number of edges per source
  const simplifiedEdges: any[] = [];
  
  edgesBySource.forEach((sourceEdges, source) => {
    // Limit to 3 outgoing edges per node
    const limitedEdges = sourceEdges.slice(0, 3);
    simplifiedEdges.push(...limitedEdges);
  });
  
  return simplifiedEdges;
}
