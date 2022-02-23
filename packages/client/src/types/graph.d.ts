export type GraphNode = {
  id: string;
  _id: string;
  attributes: {
    r: number;
    x: number;
    y: number;
    color?: string;
    text?: string;
  };
  data: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  _source: string;
  _target: string;
  _id: string;
  attributes: {
    width: number;
    color: string;
  };
};

export type Graph = {
  id: string;
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
