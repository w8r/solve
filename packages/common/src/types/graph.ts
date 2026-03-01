export interface INode {
  _id: string;
  graphId: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEdge {
  _id: string;
  graphId: string;
  sourceId: string;
  targetId: string;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGraph {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
