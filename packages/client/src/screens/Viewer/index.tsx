import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BottomMenu } from './BottomMenu';
import { getGraph } from '../../services/api';
import { Graph, GraphNode } from '../../types/graph';
import CreateNodeDialog from '../../components/CreateNodeDialog';
import { BackButton } from '../../components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { SelectionDialog } from './SelectionDialog';

const Wrapper = ({
  width,
  height,
  id
}: {
  width: number;
  height: number;
  id: string | null;
}) => {
  const { app, graph, setGraph } = useVis();
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [nodeData, setNodeData] = useState<GraphNode | null>(null);
  const [selected, setSelected] = useState<Graph | null>(null);

  useEffect(() => {
    if (id !== null) {
      getGraph(id).then((response) => setGraph(response));
    }
  }, []);

  const onPreview = (graph: Graph) => {
    // TODO: save graph here
    // show selected nodes;
    app.highlight(graph);
    setSelected(graph);
    //navigate('Preview', { graph });
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
    setDialogVisible(false);
  };

  const removeSelected = () => {
    if (!graph) return;
    const nodes = graph.nodes.filter((node) => !node.attributes.selected);
    const nodeIds = nodes.map((node) => node.id);
    const edges = graph.edges.filter(
      (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    );

    const updatedGraph = {
      ...graph,
      nodes,
      edges
    };
    setGraph(updatedGraph);
  };

  const editNode = (name: string, category: string, size: number) => {
    if (!nodeData) return;
    const updatedGraph = {
      ...graph,
      nodes: graph.nodes.map((node) => {
        if (node.attributes.selected) {
          return {
            ...node,
            data: { category },
            attributes: {
              ...node.attributes,
              r: size,
              text: name
            }
          };
        }
        return node;
      })
    };
    setGraph(updatedGraph);
    setDialogVisible(false);
    setNodeData(null);
  };

  // Should not allow editing if more than one node is selected
  const getSelectedNode = () => {
    const selectedNodes = graph.nodes.filter(
      (node) => node.attributes.selected
    );
    const node = selectedNodes.length === 1 ? selectedNodes[0] : null;
    setNodeData(node);
    return node;
  };

  if (graph.nodes.length === 0) return null;

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      <BottomMenu
        showDialog={() => {
          setNodeData(null);
          setDialogVisible(true);
        }}
        onPreview={onPreview}
        onRemove={removeSelected}
        onEdit={() => {
          const node = getSelectedNode();
          if (node) {
            setDialogVisible(true);
          }
        }}
      />
      {isDialogVisible ? (
        <CreateNodeDialog
          closeDialog={() => {
            setDialogVisible(false);
            setNodeData(null);
          }}
          addNode={addNode}
          editNode={editNode}
          data={nodeData}
        />
      ) : null}
      <SelectionDialog
        visible={selected !== null}
        onProceed={() => {
          app.highlight(null);
          console.log('ok');
        }}
        onCancel={() => {
          app.highlight(null);
          setSelected(null);
        }}
      />
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
