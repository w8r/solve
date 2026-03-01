import type { INode, IEdge } from "../types/index.js";

type NodeVisitor = (node: INode) => void;

export function dfs(nodes: INode[], edges: IEdge[], startNodeId: string, visit: NodeVisitor): void {
  const adjacency = buildAdjacencyMap(nodes, edges);
  const visited = new Set<string>();

  function traverse(nodeId: string): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n._id === nodeId);
    if (node) visit(node);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighborId of neighbors) {
      traverse(neighborId);
    }
  }

  traverse(startNodeId);
}

export function bfs(nodes: INode[], edges: IEdge[], startNodeId: string, visit: NodeVisitor): void {
  const adjacency = buildAdjacencyMap(nodes, edges);
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find((n) => n._id === nodeId);
    if (node) visit(node);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push(neighborId);
      }
    }
  }
}

function buildAdjacencyMap(nodes: INode[], edges: IEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const node of nodes) {
    map.set(node._id, []);
  }
  for (const edge of edges) {
    const neighbors = map.get(edge.sourceId);
    if (neighbors) {
      neighbors.push(edge.targetId);
    }
  }
  return map;
}
