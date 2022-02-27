import { Graph, GraphEdge, GraphNode } from '../types/graph';
// import { splitPairs } from "./utils";

export function createEdges(graph: Graph, fromNodes: GraphNode[]): GraphEdge[] {
  //const edgePairs = splitPairs(selectedNodes.map((node) => node.id));
  const existingEdges = new Set(
    graph.edges.map(({ source, target }) => `${source}-${target}`)
  );
  const edges = fromNodes
    .map((node) => node.id)
    .reduce((acc, curr, i, arr) => {
      if (i === 0) return acc;
      const source = arr[0];
      const target = curr;
      const id = `${source}-${target}`;
      if (existingEdges.has(id)) return acc;
      const edge: GraphEdge = {
        id,
        _id: id,
        source: source,
        target: target,
        attributes: {
          width: 0.25,
          color: 'blue',
          selected: false
        }
      };
      acc.push(edge);
      return acc;
    }, [] as GraphEdge[]);

  // const edges = edgePairs.map(([pair]) => {
  //   return {
  //     id: `${pair[0]}-${pair[1]}`,
  //     _id: `${pair[0]}-${pair[1]}`,
  //     source: pair[0],
  //     target: pair[1],
  //     attributes: {
  //       width: 1,
  //       color: '#000',
  //       selected: false
  //     }
  //   };
  // });
  return edges;
}
