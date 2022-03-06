import React, { useEffect, useState, FC } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import AppLoading from 'expo-app-loading';
import { Fab, Text, Icon, Spinner } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { GraphProps } from '../../navigation/types';
import { Graph, Id } from '../../types/graph';
import * as api from '../../services/api';
import { ProfileButton } from '../../components/Avatar';
import { BackButton } from '../../components/BackButton';
import { Loading } from '../../components/Loading';

export const GraphScreen: FC<GraphProps> = ({ route }) => {
  const [graph, setGraph] = useState<Graph>();
  const [subgraphs, setSubGraphs] = useState<api.SubgraphHeader[]>([]);
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
      .then((response) => setSubGraphs(response));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ProfileButton />

      {graph ? <Text style={styles.textStyle}>{graph.name}</Text> : <Loading />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loading: {
    justifyContent: 'center', //Centered horizontally
    alignItems: 'center', //Centered vertically
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
  newGraphContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flex: 1,
    marginBottom: 20,
    borderWidth: 1
  },
  newGraphButton: {
    borderWidth: 1,
    flex: 1
  },
  fab: {
    flex: 1,
    position: 'absolute',
    bottom: 20,
    right: '50%',
    marginRight: -25
  }
});
