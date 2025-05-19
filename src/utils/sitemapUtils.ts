import { Edge } from "reactflow";
import { SitemapData } from "@/services/ScraperTypes";

// Function to organize sitemap data into a waterfall layout
export const organizeSitemapData = (sitemapData: SitemapData): SitemapData => {
  if (!sitemapData || !sitemapData.nodes || sitemapData.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const { nodes, edges } = sitemapData;

  // Find the homepage node (assuming it has a specific characteristic, e.g., path === '/')
  const homepageNode = nodes.find(node => node.data.path === '/');

  if (!homepageNode) {
    // If no homepage, return original data
    return sitemapData;
  }

  const layoutedNodes = [];
  const layoutedEdges: Edge[] = [];
  const processedNodeIds = new Set<string>();

  // Initial position for the homepage
  homepageNode.position = { x: 0, y: 0 };
  layoutedNodes.push(homepageNode);
  processedNodeIds.add(homepageNode.id);

  let currentY = 200; // Initial Y position for the next level

  // Function to layout child nodes
  const layoutChildren = (parentNode: any, level: number) => {
    const children = edges
      .filter(edge => edge.source === parentNode.id)
      .map(edge => nodes.find(node => node.id === edge.target))
      .filter(Boolean);

    if (children.length === 0) {
      return;
    }

    const spacing = 300; // Horizontal spacing between nodes
    let startX = -((children.length - 1) * spacing) / 2; // Center the children

    children.forEach(child => {
      if (!processedNodeIds.has(child.id)) {
        child.position = { x: startX, y: currentY };
        layoutedNodes.push(child);
        processedNodeIds.add(child.id);
        startX += spacing;

        // Add edge from parent to child
        layoutedEdges.push({
          id: `edge-${parentNode.id}-${child.id}`,
          source: parentNode.id,
          target: child.id,
          animated: true,
          style: { stroke: '#aaa' },
        });

        layoutChildren(child, level + 1);
      } else {
        // If the node was already processed, just create an edge to it
        layoutedEdges.push({
          id: `edge-${parentNode.id}-${child.id}`,
          source: parentNode.id,
          target: child.id,
          animated: true,
          style: { stroke: '#aaa' },
        });
      }
    });

    currentY += 200; // Increase Y position for the next level
  };

  // Start layout with the homepage
  layoutChildren(homepageNode, 1);

  // Add any nodes that weren't connected to the homepage
  nodes.forEach(node => {
    if (!processedNodeIds.has(node.id)) {
      node.position = { x: 0, y: currentY }; // You might want a different layout for these
      layoutedNodes.push(node);
      processedNodeIds.add(node.id);
      currentY += 200;
    }
  });

  // Add any edges that weren't connected to the homepage
  edges.forEach(edge => {
    if (!layoutedEdges.find(e => e.id === edge.id)) {
      layoutedEdges.push(edge);
    }
  });

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  };
};
