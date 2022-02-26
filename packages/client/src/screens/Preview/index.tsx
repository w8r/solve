import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Text, View } from 'react-native';
import { Link } from 'native-base';
import { PreviewProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { Graph } from '../../types/graph';
import { BottomDrawer, DrawerState } from '../../components/BottomDrawer';
import { IconButton, Spinner, VStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { shareGraph } from '../../services/api';
import { BackButton } from '../../components/BackButton';
import { useNavigation } from '@react-navigation/native';

const Form: FC<{ setName: (name: string) => void }> = ({}) => {
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
  const [sharedGraph, setSharedGraph] = useState<Graph | null>(null);
  const [name, setName] = useState('');
  const { navigate } = useNavigation();

  useEffect(() => {
    setGraph(route.params.graph);
  }, []);

  const onSave = () => {
    setLoading(true);
    shareGraph(graph, graph.id).then((response) => {
      setSharedGraph(response);
      setSaved(true);
      setLoading(false);
    });
  };

  const buttonOpacity = isLoading ? 0.25 : 1;

  const buttons = saved ? null : (
    <View style={styles.buttons}>
      <IconButton
        disabled={isLoading}
        opacity={buttonOpacity}
        onPress={() => navigation.goBack()}
        style={styles.buttonLeft}
        _icon={{ as: Icons, name: 'arrow-left' }}
      />
      <IconButton
        disabled={isLoading}
        opacity={buttonOpacity}
        onPress={onSave}
        style={styles.buttonRight}
        _icon={{ as: Icons, name: 'check' }}
      />
    </View>
  );

  const savedMessage = saved ? (
    <View style={styles.info}>
      <VStack>
        <Text>Saved!</Text>
        <Link
          _text={{
            color: 'indigo.500'
          }}
          mt="1"
          onPress={() => navigate('Dashboard')}
        >
          Go to dashboard
        </Link>
      </VStack>
    </View>
  ) : null;

  if (graph.nodes.length === 0) return null;

  return (
    <VisProvider>
      <BackButton />
      <ProfileButton />
      <Viewer width={width} height={height} graph={graph} />
      <BottomDrawer
        onDrawerStateChange={(e) => {}}
        initialState={DrawerState.Peek}
      >
        <View style={styles.content}>
          {isLoading ? (
            <Loading />
          ) : saved ? (
            savedMessage
          ) : (
            <Form setName={setName} />
          )}
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
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff'
  },
  loading: {
    padding: 20
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#fff',
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
