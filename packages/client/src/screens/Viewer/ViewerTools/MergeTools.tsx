import { API_URL } from '@env';
import React, { useEffect, useState } from 'react';
import * as api from '../../../services/api';
import { StyleSheet } from 'react-native';
import { useVis } from '../../../components/Viewer';
import { MergeMenu } from './Menu/Merge';
import { Icon, Text, View } from 'native-base';
import { MaterialCommunityIcons as Icons } from '@expo/vector-icons';
import { Graph, GraphEdge, GraphNode, Id } from '../../../types/graph';
import { v4 as uuid } from 'uuid';

interface MergeProps {
  subgraph?: string;
}

function mergeNodes(
  subgraphNodes: GraphNode[],
  parentNodes: GraphNode[]
): GraphNode[] {
  const parentNodeIds = parentNodes.map((node) => node.id);
  const sharedSubgraphNodes = subgraphNodes.filter((node) =>
    parentNodeIds.includes(node.id)
  );
  const result: GraphNode[] = [];

  for (const node of sharedSubgraphNodes) {
    const parentNode = parentNodes.find((parent) => parent.id === node.id);
    const parentNodeIndex = parentNodes.indexOf(parentNode!);
    const subgraphNode = subgraphNodes.find(
      (subgraph) => subgraph.id === node.id
    );
    const subgraphNodeIndex = subgraphNodes.indexOf(subgraphNode!);

    const subgraphNodeNew = {
      ...subgraphNode,
      id: subgraphNode!.id + '_new',
      _id: subgraphNode!._id + '_new'
    };
    result.push(subgraphNodeNew as GraphNode);
    result.push(parentNode!);

    // remove shared node from both arrays
    parentNodes.splice(parentNodeIndex, 1);
    subgraphNodes.splice(subgraphNodeIndex, 1);
  }

  return result.concat(parentNodes, subgraphNodes);
}

function mergeEdges(
  nodeIds: string[],
  subgraphEdges: GraphEdge[],
  parentEdges: GraphEdge[]
): GraphEdge[] {
  const result: GraphEdge[] = [];
  const parentEdgeIds = parentEdges.map((edge) => edge.id);
  const sharedSubgraphEdges = subgraphEdges.filter((edge) =>
    parentEdgeIds.includes(edge.id)
  );

  sharedSubgraphEdges.forEach((edge) => {
    const parentEdge = parentEdges.find(
      (parentEdge) => parentEdge.id === edge.id
    );
    const parentEdgeIndex = parentEdges.indexOf(parentEdge!);
    const subgraphEdge = subgraphEdges.find(
      (subgraph) => subgraph.id === edge.id
    );
    const subgraphEdgeIndex = subgraphEdges.indexOf(subgraphEdge!);

    if (
      nodeIds.includes(edge.source + '_new') &&
      nodeIds.includes(edge.target + '_new')
    ) {
      const subgraphEdgeNew = {
        ...subgraphEdge,
        target: subgraphEdge!.target + '_new',
        source: subgraphEdge!.source + '_new'
      };
      result.push(subgraphEdgeNew as GraphEdge);
    } else {
      result.push(subgraphEdge!);
    }

    // remove shared edge from both arrays
    parentEdges.splice(parentEdgeIndex, 1);
    subgraphEdges.splice(subgraphEdgeIndex, 1);
  });

  return result
    .concat(parentEdges, subgraphEdges)
    .filter(
      (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    );
}

function getPremergeGraph(parent: Graph, child: Graph): Graph {
  const result = { ...parent };
  const originalNodes = result.nodes.reduce((acc, node) => {
    acc.set(node.id, node);
    return acc;
  }, new Map<Id, GraphNode>());

  // fix the subgraph topology to not depend on the parent
  const nodeMap = new Map<string, GraphNode>();
  child.nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    node.data.originalId = node.id;
    node.id = uuid();
  });

  child.edges.forEach((edge) => {
    edge.data = edge.data || {};
    edge.data.originalId = edge.id;
    edge.data.originalSource = edge.source;
    edge.data.originalTarget = edge.target;
    edge.id = uuid();
    edge._id = uuid();
    edge.source = nodeMap.get(edge.source)!.id;
    edge.target = nodeMap.get(edge.target)!.id;
  });

  child.nodes.forEach((childNode) => {
    const parentNode = originalNodes.get(childNode.data.originalId as Id);
    if (parentNode) {
      child.edges.push({
        id: uuid(),
        _id: uuid(),
        source: parentNode.id,
        target: childNode.id,
        data: {
          virtual: true
        },
        attributes: {
          width: 0.25,
          color: '#dddddd'
        }
      });
    }
  });

  return {
    ...parent,
    nodes: [...parent.nodes, ...child.nodes],
    edges: [...parent.edges, ...child.edges]
  };
}

export function MergeTools({ subgraph }: MergeProps) {
  const { graph, setGraph } = useVis();
  const [merged, setMerged] = useState(false);

  const onMerge = async () => {
    await api.resolveGraph(subgraph!, { ...graph, resolved: true });
    setGraph({ ...graph, resolved: true });
    setMerged(true);
    setTimeout(() => {
      setMerged(false);
    }, 2500);
  };

  useEffect(() => {
    console.log(subgraph);
    api.getGraph(subgraph!).then((subgraph) => {
      console.log(subgraph);
      api.getGraph(subgraph.data?.parentId!).then((parent) => {
        console.log({ parentGraph: parent });

        // const mergedNodes = mergeNodes(subgraph.nodes, parent.nodes);
        // const mergedEdges = mergeEdges(
        //   mergedNodes.map((node) => node.id),
        //   subgraph.edges,
        //   parent.edges
        // );

        // const preMergeGraph = {
        //   ...subgraph,
        //   nodes: mergedNodes,
        //   edges: mergedEdges
        // };

        const preMergeGraph = getPremergeGraph(parent, subgraph);
        console.log({ preMergeGraph });

        setGraph(preMergeGraph);
      });
    });
  }, []);

  return (
    <>
      <MergeMenu onMerge={onMerge} />
      {merged && (
        <View style={styles.container}>
          <Icon as={Icons} name="merge" size="xl" />
          <Text style={styles.textStyle}>MERGED</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // container is a white box with cute borders
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'green',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  textStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginLeft: 10,
    marginTop: -5
  }
});
