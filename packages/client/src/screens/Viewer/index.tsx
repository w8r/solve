import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ViewerProps } from '../../navigation/types';
import { useVis, Viewer, VisProvider } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BackButton } from '../../components/BackButton';
import { getGraph } from '../../services/api';

import { ProblemTools } from './ViewerTools/ProblemTools';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ProposalTools } from './ViewerTools/ProposalTools';
import { MergeTools } from './ViewerTools/MergeTools';
import { ViewerModes } from '../../types/app';

interface ViewWrapperProps {
  id: string | undefined;
  width: number;
  height: number;
  mode?: ViewerModes;
  subgraph?: string;
}
const ViewWrapper = ({
  id,
  width,
  height,
  subgraph,
  mode = 'edit'
}: ViewWrapperProps) => {
  const { navigate } = useNavigation();
  const { graph, setGraph, setSelectedNodes, setSelectedEdges } = useVis();
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  const getTools = (viewerMode: ViewerModes) => {
    switch (viewerMode) {
      case 'edit':
        return <ProblemTools />;
      case 'propose':
        return <ProposalTools subgraph={subgraph} />;
      case 'merge':
        return <MergeTools subgraph={subgraph!} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // If mode is merge, we don't need to fetch the graph mergetools handle it
    if (id && mode !== 'merge') {
      getGraph(id).then((response) => {
        setGraph(response);
        setIsLoading(false);
      });
    } else {
      setGraph({
        id: '',
        publicId: '',
        name: 'Problem',
        nodes: [],
        edges: []
      });
      setIsLoading(false);
    }
    return () => {
      setSelectedNodes([]);
      setSelectedEdges([]);
    };
  }, [id, isFocused]);

  if (isLoading) return null;
  return (
    <>
      <Viewer
        width={width}
        height={height}
        graph={graph}
        onLongPress={(node) => console.log({ node })}
      />
      {getTools(mode!)}
    </>
  );
};

export default function ({ route }: ViewerProps) {
  const { params: { graph: graphId, mode, subgraph } = {} } = route;
  const { width, height } = Dimensions.get('window');
  const { navigate } = useNavigation();

  return (
    <VisProvider>
      <BackButton fallback={() => navigate('Dashboard')} />
      <ProfileButton />
      <ViewWrapper
        id={graphId}
        width={width}
        height={height}
        mode={mode}
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
