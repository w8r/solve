import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { PreviewProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { Graph } from '../../types/graph';
import { BottomDrawer, DrawerState } from '../../components/BottomDrawer';
import { IconButton, Spinner } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { View } from '../../components/Themed';

const Form: FC<{ onSave }> = ({ onSave }) => {
  return (
    <>
      <View style={styles.info}>
        <Text>
          You are in the preview mode. You can change things to remove
          everything that can be sensitive before sharing
        </Text>
      </View>
    </>
  );
};

function Loading() {
  return (
    <View style={styles.loading}>
      <Spinner />
    </View>
  );
}

export const Preview: FC<PreviewProps> = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window');
  const [isLoading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [graph, setGraph] = useState<Graph>({
    id: 'preview',
    nodes: [],
    edges: []
  });

  useEffect(() => {
    setGraph(route.params.graph);
  }, []);

  const onSave = () => {
    setLoading(true);
    setTimeout(() => {
      setSaved(true);
    }, 2000);
  };

  const buttons = (
    <View style={styles.buttons}>
      <IconButton
        onPress={() => navigation.goBack()}
        style={styles.buttonLeft}
        _icon={{ as: Icons, name: 'arrow-left' }}
      />
      <IconButton
        onPress={() => console.log('done')}
        style={styles.buttonRight}
        _icon={{ as: Icons, name: 'check' }}
      />
    </View>
  );

  if (graph.nodes.length === 0) return null;

  return (
    <VisProvider>
      <ProfileButton />
      <Viewer width={width} height={height} graph={graph} />
      {/* <BottomDrawer /> */}
      <BottomDrawer
        onDrawerStateChange={(e) => console.log(e)}
        initialState={DrawerState.Peek}
      >
        <View style={styles.content}>
          {isLoading ? <Spinner /> : <Form />}
          {buttons}
        </View>
      </BottomDrawer>
    </VisProvider>
  );
};

const styles = StyleSheet.create({
  content: {
    height: 230
  },
  info: {
    padding: 20,
    flex: 1
  },
  loading: {
    padding: 20
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between'
  },
  buttonLeft: {
    marginLeft: 20
  },
  buttonRight: {
    marginRight: 20
  }
});
