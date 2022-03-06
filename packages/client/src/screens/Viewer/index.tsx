import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BottomMenu } from './BottomMenu';
import { getGraph } from '../../services/api';
import { getCategoryColor, Graph, GraphNode } from '../../types/graph';
import CreateNodeDialog from '../../components/Dialog/CreateNodeDialog';
import { BackButton } from '../../components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { SaveGraphDialog } from '../../components/SaveGraphDialog';
import { createEdges } from '../../lib/graph';

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
    graph,
    setGraph,
    setIsSelecting,
    startSelection,
    selectNode,
    selectEdge,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
    clearSelection
  } = useVis();
  const { navigate, isFocused } = useNavigation();
  const [nodeDialogVisible, setNodeDialogVisible] = useState(false);
  const [edgeDialogVisible, setEdgeDialogVisible] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (id !== null) {
      getGraph(id).then((response) => setGraph(response));
    } else
      setGraph({
        id: '',
        publicId: '',
        name: 'Problem',
        nodes: [],
        edges: []
      });
    return () => {
      setSelectedNodes([]);
      setSelectedEdges([]);
    };
  }, []);

  const createEdge = () => {
    const edges = createEdges(graph, selectedNodes);
    graph.edges = [...graph.edges, ...edges];
    setGraph(graph);
  };

  const addNode = (name: string, category: string, size: number) => {
    if (!graph) return;
    const newNode: GraphNode = {
      id: `${graph.nodes.length + 1}`,
      _id: `${graph.nodes.length + 1}`,
      attributes: {
        r: size,
        x: 0,
        y: 0,
        color: getCategoryColor(category),
        text: name,
        selected: false
      },
      data: { category }
    };
    graph.nodes = [...graph.nodes, newNode];
    setGraph(graph);
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
    graph.nodes = nodes;
    graph.edges = edges;
    setSelectedNodes([]);
    setSelectedEdges([]);
    setGraph(graph);
  };

  const editNode = (name: string, category: string, size: number) => {
    if (!selectedNodes || (selectedNodes && selectedNodes.length !== 1)) return;
    graph.nodes = graph.nodes.map((node) =>
      node.id === selectedNodes[0].id
        ? {
            ...node,
            attributes: {
              ...node.attributes,
              r: size,
              text: name,
              color: getCategoryColor(category)
            },
            data: { category }
          }
        : node
    );

    setGraph(graph);
    setSelectedNodes([
      {
        ...selectedNodes[0],
        data: { category },
        attributes: {
          ...selectedNodes[0].attributes,
          r: size,
          text: name,
          color: getCategoryColor(category)
        }
      }
    ]);
    setNodeDialogVisible(false);
  };

  const onSelect = () => {
    setIsSelecting(true);
    startSelection((selectedGraph) => {
      selectNode(selectedGraph.nodes.map((node) => node.id));
      selectEdge(selectedGraph.edges.map((edge) => edge._id));
      setIsSelecting(false);
    });
  };

  const onSelectClear = () => {
    clearSelection();
    setGraph(graph);
  };

  const onShare = () => {
    const selectedGraph: Graph = {
      id: graph.id,
      publicId: graph.publicId,
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

  const onCreateEdge = () => {
    if (selectedNodes && selectedNodes.length > 1) createEdge();
  };

  const onSave = () => isFocused && setShowSaveDialog(true);

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      <BottomMenu
        showDialog={() => {
          setNodeDialogVisible(true);
        }}
        onSelect={onSelect}
        onSelectClear={onSelectClear}
        onRemove={removeSelected}
        onEdit={onEdit}
        onCreateEdge={onCreateEdge}
        onShare={onShare}
        onSave={onSave}
      />
      {nodeDialogVisible && !edgeDialogVisible ? (
        <CreateNodeDialog
          closeDialog={() => {
            setNodeDialogVisible(false);
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
      {showSaveDialog && (
        <SaveGraphDialog
          onCancel={() => setShowSaveDialog(false)}
          onDone={() => {
            onSelectClear();
            setShowSaveDialog(false);
          }}
        />
      )}
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
