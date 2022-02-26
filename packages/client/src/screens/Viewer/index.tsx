import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BottomMenu } from './BottomMenu';
import { getGraph } from '../../services/api';
import { Graph, GraphEdge, GraphNode } from '../../types/graph';
import CreateNodeDialog from '../../components/Dialog/CreateNodeDialog';
import { BackButton } from '../../components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { SelectionDialog } from './SelectionDialog';
import ConnectNodeDialog from '../../components/Dialog/ConnectNodeDialog';
import _ from 'lodash';

var splitPairs = function (arr: string[]) {
  var pairs = [];
  for (var i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] !== undefined) {
      pairs.push([arr[i], arr[i + 1]]);
    } else {
      pairs.push([arr[i - 1], arr[i]]);
    }
  }
  return pairs;
};

const Wrapper = ({
  width,
  height,
  id
}: {
  width: number;
  height: number;
  id: string | null;
}) => {
  const {
    app,
    graph,
    setGraph,
    setIsSelecting,
    startSelection,
    selectNode,
    selectEdge,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges
  } = useVis();
  const { navigate } = useNavigation();
  const [nodeDialogVisible, setNodeDialogVisible] = useState(false);
  const [edgeDialogVisible, setEdgeDialogVisible] = useState(false);
  const [nodeData, setNodeData] = useState<GraphNode | null>(null);
  const [nodesData, setNodesData] = useState<[GraphNode, GraphNode] | null>(
    null
  );

  useEffect(() => {
    if (id !== null) {
      getGraph(id).then((response) => setGraph(response));
    }
    return () => {
      setSelectedNodes([]);
      setSelectedEdges([]);
    };
  }, []);

  const createEdge = () => {
    const edgePairs = splitPairs(selectedNodes.map((node) => node.id));

    const edges = edgePairs.map((pair) => {
      return {
        id: `${pair[0]}-${pair[1]}`,
        _id: `${pair[0]}-${pair[1]}`,
        source: pair[0],
        target: pair[1],
        attributes: {
          width: 1,
          color: '#000',
          selected: false
        }
      };
    });

    const updatedGraph = {
      ...graph,
      edges: [...graph.edges, ...edges]
    };
    setGraph(updatedGraph);
  };

  const addNode = (name: string, category: string, size: number) => {
    if (!graph) return;
    const updatedGraph: Graph = {
      ...graph,
      nodes: [
        ...graph.nodes,
        {
          id: `${graph.nodes.length + 1}`,
          _id: `${graph.nodes.length + 1}`,
          attributes: {
            r: size,
            x: 0,
            y: 0,
            color: 'blue',
            text: name,
            selected: false
          },
          data: { category }
        }
      ]
    };
    setGraph(updatedGraph);
    setNodeDialogVisible(false);
  };

  const removeSelected = () => {
    if (!selectedNodes && !selectedEdges) return;
    const nodeIds = selectedNodes.map((node) => node.id);
    const nodes = graph.nodes.filter((node) => !nodeIds.includes(node.id));
    const existingNodeIds = nodes.map((node) => node.id);
    const edgeIds = selectedEdges.map((edge) => edge._id);
    const edges = graph.edges.filter(
      (edge) =>
        existingNodeIds.includes(edge.source) &&
        existingNodeIds.includes(edge.target) &&
        !edgeIds.includes(edge._id)
    );

    const updatedGraph = {
      ...graph,
      nodes,
      edges
    };
    setGraph(updatedGraph);
  };

  const editNode = (name: string, category: string, size: number) => {
    if (!selectedNodes || (selectedNodes && selectedNodes.length !== 1)) return;
    const updatedGraph = {
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === selectedNodes[0].id
          ? {
              ...node,
              attributes: {
                ...node.attributes,
                r: size,
                text: name,
                color: 'blue'
              },
              data: { category }
            }
          : node
      )
    };

    setGraph(updatedGraph);
    setNodeDialogVisible(false);
    setNodeData(null);
  };

  if (graph.nodes.length === 0) return null;
  const onSelect = () => {
    setIsSelecting(true);
    startSelection((selectedGraph) => {
      selectNode(selectedGraph.nodes.map((node) => node.id));
      selectEdge(selectedGraph.edges.map((edge) => edge._id));
      setIsSelecting(false);
    });
  };

  const onShare = () => {
    const selectedGraph: Graph = {
      id: 'selected',
      nodes: [...JSON.parse(JSON.stringify(selectedNodes))],
      edges: [...JSON.parse(JSON.stringify(selectedEdges))]
    };
    selectedGraph.nodes.forEach((node) => (node.attributes.selected = false));
    selectedGraph.edges.forEach((edge) => (edge.attributes.selected = false));
    navigate('Preview', { graph: selectedGraph });
  };

  const onEdit = () => {
    if (selectedNodes && selectedNodes.length === 1) {
      setNodeDialogVisible(true);
    }
  };

  if (graph.nodes.length === 0) return null;

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      <BottomMenu
        showDialog={() => {
          setNodeData(null);
          setNodeDialogVisible(true);
        }}
        onSelect={onSelect}
        onRemove={removeSelected}
        onEdit={onEdit}
        onCreateEdge={() => {
          if (selectedNodes && selectedNodes.length > 1) {
            createEdge();
          }
        }}
        onShare={onShare}
      />
      {nodeDialogVisible && !edgeDialogVisible ? (
        <CreateNodeDialog
          closeDialog={() => {
            setNodeDialogVisible(false);
            setNodeData(null);
          }}
          addNode={addNode}
          editNode={editNode}
          data={
            selectedNodes && selectedNodes.length === 1
              ? selectedNodes[0]
              : null
          }
        />
      ) : null}
    </>
  );
};

export default function ({ route }: ViewerProps) {
  const { params: { graph: graphId } = {} } = route;
  const { width, height } = Dimensions.get('window');

  return (
    <VisProvider>
      <BackButton />
      <ProfileButton />
      <Wrapper width={width} height={height} id={graphId || null} />
    </VisProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
