export type GraphNode = {
  id: string;
  _id: string;
  attribtes: Record<string, unknown>;
  data: Record<string, unknown>;
};

export type GraphEdge = {
  source: string;
  target: string;
  _source: string;
  _target: string;
  _id: string;
};

export type Graph = {
  data?: Record<string, unknown>;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphHeader = {
  id: string;
  nodes: number;
  edges: number;
};

export interface User {
  name: string;
  email: string;
  createdAt: string;
  uuid: string;
}
