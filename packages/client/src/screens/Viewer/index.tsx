import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BottomMenu } from './BottomMenu';
import { getGraph } from '../../services/api';
import { Graph, GraphNode } from '../../types/graph';
import CreateNodeDialog from '../../components/CreateNodeDialog';

const Wrapper = ({
  width,
  height,
  id,
  onPreviewFn
}: {
  width: number;
  height: number;
  id: string | null;
  onPreviewFn: (graph: Graph) => void;
}) => {
  const { graph, setGraph } = useVis();
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [nodeData, setNodeData] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (id !== null) {
      getGraph(id).then((response) => setGraph(response));
    }
  }, []);

  const addNode = (name: string, category: string, size: number) => {
    if (!graph) return;
    const updatedGraph = {
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
            color: 'blue'
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
    if (!graph) return;
    const updatedGraph = {
      ...graph,
      nodes: graph.nodes.map((node) => {
        if (node.attributes.selected) {
          return {
            ...node,
            data: { category },
            attributes: {
              ...node.attributes,
              r: size
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
    if (nodeData) return;
    const selectedNodes = graph.nodes.filter(
      (node) => node.attributes.selected
    );
    const node = selectedNodes.length === 1 ? selectedNodes[0] : null;
    setNodeData(node);
  };

  if (graph.nodes.length === 0) return null;

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      <BottomMenu
        showDialog={() => setDialogVisible(true)}
        onPreview={onPreviewFn}
        onRemove={removeSelected}
        onEdit={() => {
          getSelectedNode();
          if (nodeData) {
            setDialogVisible(true);
          }
        }}
      />
      <CreateNodeDialog
        closeDialog={() => setDialogVisible(false)}
        visibility={isDialogVisible}
        addNode={addNode}
        editNode={editNode}
        data={nodeData}
      />
    </>
  );
};

export default function ({ route, navigation }: ViewerProps) {
  const { params: { graph: graphId } = {} } = route;
  const { width, height } = Dimensions.get('window');

  const onPreview = (graph: Graph) => {
    // TODO: save graph here
    navigation.navigate('Preview', { graph });
  };

  return (
    <VisProvider>
      <ProfileButton />
      <Wrapper
        width={width}
        height={height}
        id={graphId || null}
        onPreviewFn={onPreview}
      />
    </VisProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
