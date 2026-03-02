export interface INodeAttributes {
  x: number;
  y: number;
  r: number; // radius
  color: string;
  text?: string;
  selected: boolean;
  opacity: number;
}

export interface INode {
  _id: string;
  graphId: string;
  type: string;
  attributes: INodeAttributes;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEdgeAttributes {
  width: number;
  color: string;
  selected: boolean;
  opacity: number;
}

export interface IEdge {
  _id: string;
  graphId: string;
  sourceId: string;
  targetId: string;
  attributes: IEdgeAttributes;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGraph {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  tags: string[];
  resolved?: boolean;
  forks?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Category colors from legacy - used for node coloring by problem domain
export enum CategoryColors {
  Health = "red",
  Money = "green",
  Relationship = "blue",
  Meaning = "purple",
  Happiness = "orange",
}

export const CATEGORIES = ["Money", "Health", "Relationship", "Meaning", "Happiness"] as const;
export type Category = (typeof CATEGORIES)[number];

export function getCategoryColor(category: string): string {
  switch (category) {
    case "Health":
      return CategoryColors.Health;
    case "Money":
      return CategoryColors.Money;
    case "Relationship":
      return CategoryColors.Relationship;
    case "Meaning":
      return CategoryColors.Meaning;
    case "Happiness":
      return CategoryColors.Happiness;
    default:
      return CategoryColors.Health;
  }
}

// Default attribute factories for creating new nodes/edges
export const DEFAULT_NODE_ATTRIBUTES: Omit<INodeAttributes, "x" | "y"> = {
  r: 20,
  color: CategoryColors.Health,
  selected: false,
  opacity: 1,
};

export const DEFAULT_EDGE_ATTRIBUTES: IEdgeAttributes = {
  width: 2,
  color: "#666666",
  selected: false,
  opacity: 1,
};

// Type guard to distinguish nodes from edges
export function isNode(el: INode | IEdge): el is INode {
  return !("sourceId" in el);
}
