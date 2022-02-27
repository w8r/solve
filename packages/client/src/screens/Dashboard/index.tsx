import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Button, Fab, Text, View, Icon } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import * as api from '../../services/api';
import { ProfileButton } from '../../components/Avatar';

import Placeholder from './Placeholder';
import Graphs from './Graphs';
import { SearchText } from '../../components/SearchText';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const { navigate } = useNavigation();

  const showGraph = () => {
    if (graphs.length > 0) {
      return <Graphs graphs={graphs} />;
    } else {
      return <Text style={styles.textStyle}>No graph was found.</Text>;
    }
  };

  const handleSearch = (text: string) => {
    if (text.length > 0) {
      setLoading(true);
      setRequested(true);
      api
        .searchGraph(text)
        .then((response) => {
          setGraphs(response);
        })
        .catch((error) => {
          setError(error);
        })
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
      .then((response) => isFocused && setGraphs(response))
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ProfileButton />
      <SearchText onChangeText={handleSearch} />
      {isLoading ? <Placeholder /> : showGraph()}
      <Fab
        style={styles.fab}
        renderInPortal={false}
        onPress={() =>
          navigate('App', {
            screen: 'TabOne',
            params: {
              screen: 'Viewer',
              params: []
            }
          })
        }
        icon={<Icon color="white" as={Icons} name="plus" size="4" />}
      />
    </SafeAreaView>
  );
}

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
