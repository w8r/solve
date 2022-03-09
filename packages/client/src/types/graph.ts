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

export enum CategoryColors {
  Health = 'red',
  Money = 'green',
  Relationship = 'blue',
  Meaning = 'purple',
  Happiness = 'orange'
}

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Health':
      return CategoryColors.Health;
    case 'Money':
      return CategoryColors.Money;
    case 'Relationship':
      return CategoryColors.Relationship;
    case 'Meaning':
      return CategoryColors.Meaning;
    case 'Happiness':
      return CategoryColors.Happiness;
    default:
      return CategoryColors.Health;
  }
};

export const categoryArray = [
  'Money',
  'Health',
  'Relationship',
  'Meaning',
  'Happiness'
];

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
  publicId: Id;
  name?: string;
  resolved?: boolean;
  data?: {
    shared?: boolean;
    parentId?: string;
    [key: string]: unknown;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  updatedAt?: string;
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
