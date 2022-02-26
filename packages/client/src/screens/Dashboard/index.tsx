import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Button, Text, View } from 'native-base';

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
      <View style={styles.newGraphContainer}>
        <Button
          onPress={() =>
            navigate('App', {
              screen: 'TabOne',
              params: {
                screen: 'Viewer',
                params: []
              }
            })
          }
          style={styles.buttonStyle}
        >
          <Text style={{ color: '#fff' }}>Create a new graph</Text>
        </Button>
      </View>
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
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20
  },
  buttonStyle: {
    position: 'relative',
    bottom: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
