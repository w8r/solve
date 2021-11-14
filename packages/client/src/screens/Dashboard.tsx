import React, { useEffect, useState } from 'react';
import { Box, Center, FlatList, Hidden, ScrollView, VStack } from 'native-base';
import { Logo } from '../components';
import { useIsFocused } from '@react-navigation/native';
import * as api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Graph } from '../types/graph';
import { ProfileButton } from '../components/Avatar';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(false);
  const [graphs, setGraphs] = useState<Graph[] | null>(null);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Dashboard is focused', isFocused, isLoading);
    if (isFocused && graphs === null && !isLoading) {
      console.log('Fetching graphs');
      setLoading(true);

      api
        .getUserGraphs(user.uuid)
        .then((response) => setGraphs(response))
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }
    // unload
    if (!isFocused) {
      setGraphs(null);
      setLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <ScrollView>
        <Box padding="10" flex={1} p="5">
          <Center>
            <FlatList
              numColumns={5}
              data={Array(10)
                .fill(0)
                .map(() => ({}))}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ index }) => (
                <Box
                  bg="blueGray.200"
                  p="2"
                  rounded="sm"
                  height="40"
                  minWidth="40"
                  marginRight="10"
                  marginBottom="10"
                />
              )}
            />
          </Center>
        </Box>
      </ScrollView>
    );
  }

  return (
    <>
      <Hidden till="lg">
        <Logo />
      </Hidden>
      <VStack />
      <ProfileButton />
    </>
  );
}
