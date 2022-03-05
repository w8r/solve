import React from 'react';
import { Box, FlatList, Image, Text } from 'native-base';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';

export default function Graphs({ graphs }: { graphs: Graph[] }) {
  const { navigate } = useNavigation();
  const { width } = Dimensions.get('window');
  const columns = width < 400 ? 2 : 4;

  const onPress = (index: number) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: graphs[index] ? { graph: graphs[index].id } : undefined
      }
    });
  };

  return (
    <Box style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        numColumns={columns}
        data={graphs}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item: graph, index }) => {
          return (
            <TouchableOpacity onPress={() => onPress(index)}>
              <Box
                rounded="sm"
                minWidth="40"
                maxWidth="40"
                marginRight={(index + 1) % columns === 0 ? 0 : 5}
                marginBottom="5"
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
                <Text maxWidth={40}>{graph.name || 'Graph name'}</Text>
              </Box>
            </TouchableOpacity>
          );
        }}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 0,
    paddingTop: 40
  },
  image: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  listContent: {
    margin: 0,
    padding: 0
  }
});
