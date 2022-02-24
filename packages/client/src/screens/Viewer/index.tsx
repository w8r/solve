import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
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
  id
}: {
  width: number;
  height: number;
  id: string | null;
}) => {
  const { graph, setGraph } = useVis();
  useEffect(() => {
    if (id !== null) {
      getGraph(id).then((response) => setGraph(response));
    }
  }, []);
  return <Viewer width={width} height={height} graph={graph} />;
};

export default function ({ route }: ViewerProps) {
  const { width, height } = Dimensions.get('window');
  const { params: { graph: graphId } = {} } = route;
  const [graph, setGraph] = useState<Graph>();
  const [isDialogVisible, setDialogVisible] = useState(false);
  
  useEffect(() => {
    if (graphId) {
      getGraph(graphId).then((graph) => setGraph(graph));
    }
  }, []);
  return (
    <VisProvider>
      <ProfileButton />
      <Wrapper width={width} height={height} id={graphId || null} />
      <BottomMenu />
    </VisProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
