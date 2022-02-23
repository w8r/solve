import React from 'react';
import { Box, FlatList, Image } from 'native-base';
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
    <Box style={styles.container} padding={0} p="5">
      <FlatList
        flex={1}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        numColumns={columns}
        data={graphs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: graph, index }) => {
          return (
            <TouchableOpacity onPress={() => onPress(index)}>
              <Image
                style={styles.image}
                alt=""
                source={{
                  uri: getGraphPreviewURL(graph.id) + `?${Date.now()}`
                }}
                width={40}
                height={40}
              />
            </TouchableOpacity>
          );
        }}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 0,
    width: '100%'
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
    width: '100%',
    margin: 0,
    padding: 0,
    alignItems: 'center'
  }
});
