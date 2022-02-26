export type Id = string;

export type GraphNode = {
  id: Id;
  _id: Id;
  attributes: {
    r: number;
    x: number;
    y: number;
    color?: string;
    text?: string;
    selected: boolean;
  };
  data: Record<string, unknown>;
};

export type GraphEdge = {
  id: Id;
  source: string;
  target: string;
  _id: Id;
  attributes: {
    selected?: boolean;
    width: number;
    color: string;
  };
};

export function isNode(el: GraphNode | GraphEdge): el is GraphNode {
  // @ts-ignore
  return el.source === undefined;
}

export type Graph = {
  id: Id;
  data?: Record<string, unknown>;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphHeader = {
  id: Id;
  nodes: number;
  edges: number;
};

export interface User {
  name: string;
  email: string;
  createdAt: string;
  uuid: string;
}
