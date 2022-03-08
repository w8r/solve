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
}
const ViewWrapper = ({ id, width, height, viewerMode }: ViewWrapperProps) => {
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
      setSelectedNodes([]);
      setSelectedEdges([]);
    };
  }, []);

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      {viewerMode === 'proposal' ? (
        <ProposalTools />
      ) : (
        <ProblemTools navigate={navigate} isFocused={isFocused} />
      )}
    </>
  );
};

export default function ({ route }: ViewerProps) {
  const { params: { graph: graphId, viewerMode } = {} } = route;
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
      />
    </VisProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
