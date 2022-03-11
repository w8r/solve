import React, { useEffect, useState, FC } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Text, Icon, Image, Center, VStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ProposalProps } from '../../navigation/types';
import { Graph } from '../../types/graph';
import * as api from '../../services/api';
import { ProfileButton } from '../../components/Avatar';
import { BackButton } from '../../components/BackButton';
import { Loading } from '../../components/Loading';
import { Header } from './Header';
import { List } from './List';

export const ProposalScreen: FC<ProposalProps> = ({ route }) => {
  const [graph, setGraph] = useState<Graph>();
  const [subgraph, setSubGraph] = useState<Graph>();
  const [proposals, setProposals] = useState<api.GraphProposals>({
    id: '',
    publicId: '',
    nodes: [],
    edges: [],
    forks: []
  });
  const [isLoading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const { navigate } = useNavigation();
  const {
    params: { graph: graphId, subgraph: subgraphId }
  } = route;

  useEffect(() => {
    api.getInternalGraph(subgraphId).then((response) => setSubGraph(response));

    api.getInternalGraph(graphId).then((response) => {
      setGraph(response);
      api
        .getGraphProposals(response.publicId)
        .then((response) => setProposals(response))
        .then(() => setLoading(false));
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ProfileButton />
      {graph && subgraph ? (
        <Center style={styles.content}>
          {isLoading ? (
            <Loading />
          ) : (
            <List
              proposals={proposals}
              subgraph={subgraphId}
              Header={() => <Header graph={subgraph} />}
            />
          )}
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
  content: { flex: 1 },
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
