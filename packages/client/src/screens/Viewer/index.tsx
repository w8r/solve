import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ViewerProps } from '../../navigation/types';
import { useVis, Viewer, VisProvider } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { BackButton } from '../../components/BackButton';
import { getGraph } from '../../services/api';

import { ProblemTools } from './ViewerTools/ProblemTools';
import { useNavigation } from '@react-navigation/native';
import { ProposalTools } from './ViewerTools/ProposalTools';
import { MergeTools } from './ViewerTools/MergeTools';

interface ViewWrapperProps {
  id: string | undefined;
  width: number;
  height: number;
  viewerMode?: 'problem' | 'proposal' | 'merge';
  subgraph?: string;
}
const ViewWrapper = ({
  id,
  width,
  height,
  subgraph,
  viewerMode
}: ViewWrapperProps) => {
  const { navigate, isFocused } = useNavigation();
  const { graph, setGraph, setSelectedNodes, setSelectedEdges } = useVis();
  const [isLoading, setIsLoading] = useState(true);

  const getTools = (viewerMode: 'problem' | 'proposal' | 'merge') => {
    switch (viewerMode) {
      case 'problem':
        return <ProblemTools navigate={navigate} isFocused={isFocused} />;
      case 'proposal':
        return <ProposalTools subgraph={subgraph} />;
      case 'merge':
        return <MergeTools subgraph={subgraph} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // If mode is merge, we don't need to fetch the graph mergetools handle it
    if (id && viewerMode !== 'merge') {
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
  }, []);

  if (isLoading) return null;
  return (
    <>
      <Viewer
        width={width}
        height={height}
        graph={graph}
        onLongPress={(node) => console.log({ node })}
      />
      {getTools(viewerMode!)}
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
