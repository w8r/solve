import type { IGraph, INode, IEdge } from "../types/index.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGraph(graph: IGraph, nodes: INode[], edges: IEdge[]): ValidationResult {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map((n) => n._id));

  // Check for orphan edges (edges pointing to non-existent nodes)
  for (const edge of edges) {
    if (!nodeIds.has(edge.sourceId)) {
      errors.push(`Edge ${edge._id} references non-existent source node ${edge.sourceId}`);
    }
    if (!nodeIds.has(edge.targetId)) {
      errors.push(`Edge ${edge._id} references non-existent target node ${edge.targetId}`);
    }
    if (edge.graphId !== graph._id) {
      errors.push(`Edge ${edge._id} has graphId ${edge.graphId} but expected ${graph._id}`);
    }
  }

  // Check node graph references
  for (const node of nodes) {
    if (node.graphId !== graph._id) {
      errors.push(`Node ${node._id} has graphId ${node.graphId} but expected ${graph._id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
