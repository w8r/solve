export type GraphNode = {
  id: string;
  _id: string;
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
  id: string;
  source: string;
  target: string;
  _id: string;
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
