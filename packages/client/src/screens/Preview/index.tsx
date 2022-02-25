import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { PreviewProps, ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { Graph } from '../../types/graph';
import { BottomDrawer } from '../../components/BottomDrawer';

export const Preview: FC<PreviewProps> = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window');
  const [graph, setGraph] = useState<Graph>({
    id: 'preview',
    nodes: [],
    edges: []
  });

  useEffect(() => {
    setGraph(route.params.graph);
  }, []);

  return (
    <VisProvider>
      <ProfileButton />
      <Viewer width={width} height={height} graph={graph} />
      {/* <BottomDrawer /> */}
      <BottomDrawer onDrawerStateChange={(e) => console.log(e)}>
        <Text>Hello</Text>
      </BottomDrawer>
    </VisProvider>
  );
};
