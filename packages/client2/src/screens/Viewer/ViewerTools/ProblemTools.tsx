import React, { useEffect, useState } from 'react';
import uuid from '../../../lib/uuid';
import { useVis } from '../../../components/Viewer';
import { ProblemMenu } from './Menu/Problem';
import { getCategoryColor, Graph, GraphNode } from '../../../types/graph';
import CreateNodeDialog from '../../../components/Dialog/CreateNodeDialog';
import { SaveGraphDialog } from '../../../components/SaveGraphDialog';
import { createEdges } from '../../../lib/graph';
import { useNavigation } from '@react-navigation/native';

export function ProblemTools() {
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

  const createEdge = () => {
    const edges = createEdges(graph, selectedNodes);
    setGraph({ ...graph, edges: [...graph.edges, ...edges] });
  };

  useEffect(() => {
    console.log('ProblemTools: useEffect', graph.publicId);
    setNodeDialogVisible(graph.publicId === '');
  }, [graph.publicId]);

  const addNode = (name: string, category: string, size: number) => {
    if (!graph) return;
    const id = uuid();
    const newNode: GraphNode = {
      id,
      _id: id,
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
    setGraph({ ...graph, nodes: [...graph.nodes, newNode] });
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
    setSelectedNodes([]);
    setSelectedEdges([]);
    setGraph({ ...graph, nodes, edges });
  };

  const editNode = (name: string, category: string, size: number) => {
    if (!selectedNodes || (selectedNodes && selectedNodes.length !== 1)) return;
    const nodes = graph.nodes.map((node) =>
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

    setGraph({ ...graph, nodes });
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
      setGraph({ ...graph });
      setIsSelecting(false);
    });
  };

  const onSelectClear = () => {
    clearSelection();
    setGraph({ ...graph });
  };

  const onShare = () => {
    const selectedGraph: Graph = {
      id: graph.id,
      publicId: graph.publicId,
      name: `Part of "${graph.name}"`,
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

  const onSave = () => isFocused() && setShowSaveDialog(true);

  return (
    <>
      <ProblemMenu
        showDialog={() => setNodeDialogVisible(true)}
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
          closeDialog={() => setNodeDialogVisible(false)}
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
}
