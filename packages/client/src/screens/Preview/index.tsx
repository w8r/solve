import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { PreviewProps, ViewerProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { Graph } from '../../types/graph';
import { BottomDrawer, DrawerState } from '../../components/BottomDrawer';
import { Box, Button, HStack, Icon, IconButton, VStack } from 'native-base';
import { FontAwesome as Icons } from '@expo/vector-icons';

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
      <BottomDrawer
        onDrawerStateChange={(e) => console.log(e)}
        initialState={DrawerState.Peek}
      >
        <Box style={styles.info}>
          <VStack>
            <Text>
              You are in the preview mode. You can change things to remove
              everything that can be sensitive before sharing
            </Text>
            <Box style={{ justifyContent: 'space-between' }}>
              <IconButton
                style={{}}
                _icon={{ as: Icons, name: 'arrow-left' }}
              />
              <Button>Save</Button>
            </Box>
          </VStack>
        </Box>
      </BottomDrawer>
    </VisProvider>
  );
};

const styles = StyleSheet.create({
  info: {
    padding: 20
  }
});
