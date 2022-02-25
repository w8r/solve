import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Hidden } from 'native-base';

import { useIsFocused } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components';
import { ProfileButton } from '../../components/Avatar';

import Placeholder from './Placeholder';
import Graphs from './Graphs';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && !requested && !isLoading) {
      setLoading(true);
      setRequested(true);

      api
        .getUserGraphs()
        .then((response) => isFocused && setGraphs(response))
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }
    // unload
    if (!isFocused) {
      setGraphs([]);
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* <Hidden till="lg">
        <Logo />
      </Hidden> */}
      <ProfileButton />
      {isLoading ? <Placeholder /> : <Graphs graphs={graphs} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
