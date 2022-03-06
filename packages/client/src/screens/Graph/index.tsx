import React, { useEffect, useState, FC } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Text, Icon, Image, Center, VStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { GraphProps } from '../../navigation/types';
import { Graph } from '../../types/graph';
import * as api from '../../services/api';
import { ProfileButton } from '../../components/Avatar';
import { BackButton } from '../../components/BackButton';
import { Loading } from '../../components/Loading';
import { Header } from './Header';
import { List } from './List';

export const GraphScreen: FC<GraphProps> = ({ route }) => {
  const [graph, setGraph] = useState<Graph>();
  const [subgraphs, setSubGraphs] = useState<api.SubgraphHeader[]>([]);
  const [isLoading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const { navigate } = useNavigation();
  const {
    params: { graph: graphId }
  } = route;

  useEffect(() => {
    api
      .getGraph(graphId)
      .then((response) => setGraph(response))
      .then(() => api.getSubGraphs(graphId))
      .then((response) => setSubGraphs(response))
      .then(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ProfileButton />
      {graph ? (
        <Center>
          <Header graph={graph} />
          {isLoading ? <Loading /> : <List graphs={subgraphs} />}
        </Center>
      ) : (
        <Loading />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textStyle: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 20,
    top: 200,
    textAlign: 'center',
    marginTop: 20
  },
  image: {
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1
  }
});
