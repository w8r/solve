import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ViewerProps } from '../../navigation/types';
import { useVis, Viewer, VisProvider } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BackButton } from '../../components/BackButton';
import { getGraph } from '../../services/api';

import { ProblemTools } from './ViewerTools/ProblemTools';
import { useNavigation } from '@react-navigation/native';
import { ProposalTools } from './ViewerTools/ProposalTools';

interface ViewWrapperProps {
  id: string | undefined;
  width: number;
  height: number;
  viewerMode?: 'problem' | 'proposal';
  subgraph?: string;
}
const ViewWrapper = ({ id, width, height, subgraph, viewerMode }: ViewWrapperProps) => {
  const { navigate, isFocused } = useNavigation();
  const { graph, setGraph, setSelectedNodes, setSelectedEdges } = useVis();

  // default mode
  if (!viewerMode) viewerMode = 'problem';

  useEffect(() => {
    if (id) {
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
      console.log('viewer kill');
      setSelectedNodes([]);
      setSelectedEdges([]);
    };
  }, []);

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      {viewerMode === 'proposal' ? (
        <ProposalTools subgraph={subgraph} />
      ) : (
        <ProblemTools navigate={navigate} isFocused={isFocused} />
      )}
    </>
  );
};

export default function ({ route }: ViewerProps) {
  const { params: { graph: graphId, viewerMode, subgraph } = {} } = route;
  const { width, height } = Dimensions.get('window');

  return (
    <VisProvider>
      <BackButton />
      <ProfileButton />
      <ViewWrapper
        id={graphId}
        width={width}
        height={height}
        viewerMode={viewerMode}
        subgraph={subgraph}
      />
    </VisProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
