import uuid from '../lib/uuid';

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
    opacity?: number;
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
    opacity?: number;
  };
  data?: Record<string, unknown>;
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
  forks?: number;
  user?: {
    name: string;
    _id: string;
  };
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

function ensureNoOverlap(node: GraphNode, originalNode?: GraphNode) {
  if (!originalNode) return;
  if (node.attributes.x === originalNode.attributes.x)
    node.attributes.x += (Math.random() - 0.5) * 0.1;
  if (node.attributes.y === originalNode.attributes.y)
    node.attributes.y += (Math.random() - 0.5) * 0.1;
}

export function getPremergeGraph(parent: Graph, child: Graph): Graph {
  parent = JSON.parse(JSON.stringify(parent));
  child = JSON.parse(JSON.stringify(child));
  const originalNodes = parent.nodes.reduce((acc, node) => {
    acc.set(node.id, node);
    return acc;
  }, new Map<Id, GraphNode>());
  const originalEdges = parent.edges.reduce((acc, edge) => {
    acc.set(edge.id, edge);
    return acc;
  }, new Map<Id, GraphEdge>());

  // fix the subgraph topology to not depend on the parent
  const nodeMap = new Map<string, GraphNode>();
  child.nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    node.data.originalId = node.id;
    node.id = node._id = uuid();
    const originalNode = originalNodes.get(node.data.originalId as Id);
    ensureNoOverlap(node, originalNode);
  });

  const gray = '#333333';
  const transparent = 0.4;

  // all parent nodes: gray out
  parent.nodes.forEach((node) => {
    node.attributes.opacity = transparent;
    node.data.originalColor = node.attributes.color;
    node.attributes.color = gray;
  });
  // all parent edges: gray out
  parent.edges.forEach((edge) => {
    edge.attributes.opacity = transparent;
    edge.data = edge.data || {};
    edge.data.originalColor = edge.attributes.color;
    edge.attributes.color = gray;
  });

  child.edges.forEach((edge) => {
    edge.data = edge.data || {};
    edge.data.originalId = edge.id;
    edge.data.originalSource = edge.source;
    edge.data.originalTarget = edge.target;
    edge.id = uuid();
    edge._id = edge.id;
    edge.source = nodeMap.get(edge.source)!.id;
    edge.target = nodeMap.get(edge.target)!.id;

    const originalEdge = originalEdges.get(edge.data.originalId as Id);
    if (originalEdge) {
      edge.attributes.color = originalEdge.attributes.color;
    }
  });

  child.nodes.forEach((childNode) => {
    const parentNode = originalNodes.get(childNode.data.originalId as Id);
    if (parentNode) {
      const id = uuid();
      child.edges.push({
        id,
        _id: id,
        source: parentNode.id,
        target: childNode.id,
        data: {
          invalid: true
        },
        attributes: {
          width: 0.1,
          color: '#bbbbbb'
        }
      });
      parentNode.attributes.color = childNode.attributes.color;
    }
  });

  return {
    ...parent,
    nodes: [...parent.nodes, ...child.nodes],
    edges: [...parent.edges, ...child.edges]
  };
}

export function mergeGraph(graph: Graph) {
  console.log(graph);
  const nodes = graph.nodes.reduce((acc, node) => {
    acc.set(node.id, node);
    return acc;
  }, new Map<Id, GraphNode>());
  const edges = graph.edges.reduce((acc, edge) => {
    acc.set(edge.id, edge);
    return acc;
  }, new Map<Id, GraphEdge>());

  graph.nodes.forEach((node) => {
    if (node.data.originalId) {
      const originalNode = nodes.get(node.data.originalId as Id);
      if (originalNode) {
        originalNode.data.invalid = true;
        originalNode.data.replacedWith = node.id;
      }
    } else {
      node.attributes.color = node.data.originalColor as string;
      node.attributes.opacity = 1;
    }
  });

  graph.edges.forEach((edge) => {
    if (edge.data?.originalId) {
      const originalEdge = edges.get(edge.data.originalId as Id);
      if (originalEdge) {
        originalEdge.data!.invalid = true;
      }
    } else {
      edge.attributes.color = edge.data?.originalColor as string;
      edge.attributes.opacity = 1;
    }

    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (source?.data.invalid) {
      edge.source = source.data.replacedWith as Id;
    }
    if (target?.data.invalid) {
      edge.target = target.data.replacedWith as Id;
    }
  });

  return {
    ...graph,
    nodes: graph.nodes.filter((node) => !node.data.invalid),
    edges: graph.edges.filter((edge) => !edge.data?.invalid)
  };
}
