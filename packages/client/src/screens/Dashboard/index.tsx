import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Fab, Text, Icon, HStack, VStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import { tintColorLight } from '../../constants/Colors';
import * as api from '../../services/api';
import { ProfileButton } from '../../components/Avatar';

import Placeholder from './Placeholder';
import Graphs, { GraphsWithSections } from './Graphs';
import { SearchText } from '../../components/SearchText';
import { TouchableOpacity } from 'react-native-gesture-handler';

function categorizeGraphs(graphs: Graph[]): GraphsWithSections[] {
  const roots = graphs.filter((graph) => !graph.data?.parentId);
  const forks = graphs.filter((graph) => graph.data?.parentId);
  if (roots.length === 0 && forks.length === 0) {
    return [];
  }

  return [
    { title: 'Root Graphs', data: [{ graphs: roots }] },
    { title: 'Subgraphs', data: [{ graphs: forks }] }
  ];
}

export default function Dashboard() {
  const [isLoading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [graphs, setGraphs] = useState<GraphsWithSections[]>([]);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const { navigate } = useNavigation();

  const createNewGraph = () =>
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: []
      }
    });

  const showGraph = () => {
    if (!isFocused) return null;
    return (
      <Graphs
        graphs={graphs}
        emptyComponent={
          <VStack style={styles.emptyContainer}>
            <Text style={styles.textStyle}>Nothing here yet.</Text>
            <TouchableOpacity onPress={createNewGraph}>
              <Text style={styles.link}>Create new?</Text>
            </TouchableOpacity>
          </VStack>
        }
      />
    );
  };

  const handleSearch = (text: string) => {
    if (text.length > 0) {
      setLoading(true);
      setRequested(true);
      api
        .searchGraph(text)
        .then((response) => setGraphs(categorizeGraphs(response)))
        .catch((error) => setError(error))
        .finally(() => {
          setLoading(false);
          setRequested(false);
        });
    } else {
      setRequested(true);
      getMyGraphs();
    }
  };

  const getMyGraphs = () => {
    api
      .getUserGraphs()
      .then((response) => isFocused && setGraphs(categorizeGraphs(response)))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isFocused && !requested && !isLoading) {
      setLoading(true);
      setRequested(true);
      getMyGraphs();
    }
    // unload
    if (!isFocused) {
      setGraphs([]);
      setLoading(false);
    }
    return () => {
      setRequested(false);
    };
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <ProfileButton />
      <SearchText onChangeText={handleSearch} />
      {isLoading ? <Placeholder /> : showGraph()}
      <Fab
        style={styles.fab}
        renderInPortal={false}
        onPress={createNewGraph}
        icon={<Icon color="white" as={Icons} name="plus" size="4" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  emptyContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  textStyle: {},
  link: {
    color: tintColorLight
  },
  newGraphButton: {
    borderWidth: 1,
    flex: 1
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: '50%',
    marginRight: -25
  }
});
