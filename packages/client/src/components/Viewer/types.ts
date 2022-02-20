export interface GraphNode {
  id: number;
  attributes: { x: number; y: number; r: number; color: string; text?: string };
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  attributes: { color: string; width: number };
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
