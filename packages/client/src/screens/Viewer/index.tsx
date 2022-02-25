import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BottomMenu } from './BottomMenu';
import { getGraph } from '../../services/api';
import { Graph } from '../../types/graph';
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

  useEffect(() => {
    if (id !== null) {
      console.log('id', id);
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
            color: 'blue',
            text: name
          },
          data: { category }
        }
      ]
    };
    setGraph(updatedGraph);
    setDialogVisible(false);
  };

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      <BottomMenu
        showDialog={() => setDialogVisible(!isDialogVisible)}
        onPreview={onPreviewFn}
      />
      <CreateNodeDialog
        visibility={isDialogVisible}
        setVisibility={setDialogVisible}
        addNode={addNode}
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
