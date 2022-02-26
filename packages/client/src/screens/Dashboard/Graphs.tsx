import React from 'react';
import { Box, FlatList, Image, Center } from 'native-base';
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
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: graph, index }) => {
          return (
            <TouchableOpacity onPress={() => onPress(index)}>
              <Box
                rounded="sm"
                height="40"
                minWidth="40"
                marginRight="5"
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
  list: {
    width: '100%',
    padding: 20
  },
  image: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)'
  },
  listContent: {
    margin: 0,
    padding: 20
  }
});
