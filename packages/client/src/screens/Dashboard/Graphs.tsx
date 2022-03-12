import React, { PropsWithChildren, ReactElement } from 'react';
import {
  Badge,
  Box,
  FlatList,
  HStack,
  Icon,
  Image,
  Text,
  View
} from 'native-base';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';
import { Feather as Icons } from '@expo/vector-icons';

export default function Graphs({
  graphs,
  emptyComponent
}: PropsWithChildren<{ graphs: Graph[]; emptyComponent: ReactElement }>) {
  const { navigate } = useNavigation();
  const { width } = Dimensions.get('window');
  const columns = width < 400 ? 2 : 4;

  const onPress = (index: number) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: graphs[index]
          ? { viewerMode: 'problem', graph: graphs[index].id }
          : undefined
      }
    });
  };

  const onBadgePress = (index: number) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Graph',
        params: { graph: graphs[index].id }
      }
    });
  };

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      numColumns={columns}
      data={graphs}
      ListEmptyComponent={emptyComponent}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item: graph, index }) => {
        return (
          <TouchableOpacity onPress={() => onPress(index)}>
            <Box
              rounded="sm"
              minWidth="40"
              maxWidth="40"
              marginRight={(index + 1) % columns === 0 ? 0 : 5}
              marginBottom={index === graphs.length - 1 ? 100 : 5}
            >
              <Image
                style={styles.image}
                alt={graph.id}
                source={{
                  uri: getGraphPreviewURL(graph.id) + `?${Date.now()}`
                }}
                width="40"
                height="40"
              />
              <HStack
                marginTop="2"
                space="2"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text flexShrink={1} maxWidth={40}>
                  {graph.name || 'Graph name'}
                </Text>
                <TouchableOpacity onPress={() => onBadgePress(index)}>
                  <Badge marginLeft="3" rounded="md" flexDirection="row">
                    <Icon
                      as={Icons}
                      name="git-branch"
                      size="3"
                      marginRight="1"
                    />
                    {graph.forks}
                  </Badge>
                </TouchableOpacity>
              </HStack>
            </Box>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 0,
    paddingTop: 40,
    borderWidth: 1
  },
  textStyle: {},
  image: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  listContent: {
    margin: 0,
    padding: 0,
    flex: 1,
    alignItems: 'center'
  }
});
