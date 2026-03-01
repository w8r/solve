import type { INode, IEdge } from '../types/index.js';

/**
 * Find all nodes that depend on the given node (direct and transitive)
 */
export function findDependents(
  nodeId: string,
  nodes: INode[],
  edges: IEdge[]
): string[] {
  const dependents: string[] = [];
  const visited = new Set<string>();

  // Edges where sourceId is our node = nodes that depend on us
  function traverse(currentId: string): void {
    for (const edge of edges) {
      if (edge.sourceId === currentId && !visited.has(edge.targetId)) {
        visited.add(edge.targetId);
        dependents.push(edge.targetId);
        traverse(edge.targetId);
      }
    }
  }

  traverse(nodeId);
  return dependents;
}

/**
 * Find all nodes that the given node depends on (direct and transitive)
 */
export function findDependencies(
  nodeId: string,
  nodes: INode[],
  edges: IEdge[]
): string[] {
  const dependencies: string[] = [];
  const visited = new Set<string>();

  function traverse(currentId: string): void {
    for (const edge of edges) {
      if (edge.targetId === currentId && !visited.has(edge.sourceId)) {
        visited.add(edge.sourceId);
        dependencies.push(edge.sourceId);
        traverse(edge.sourceId);
      }
    }
  }

  traverse(nodeId);
  return dependencies;
}

/**
 * Detect cycles in the graph
 */
export function hasCycle(nodes: INode[], edges: IEdge[]): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const adjacency = new Map<string, string[]>();
  for (const node of nodes) {
    adjacency.set(node._id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.sourceId)?.push(edge.targetId);
  }

  function dfs(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true; // Cycle detected
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (dfs(neighbor)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node._id)) return true;
  }
  return false;
}
