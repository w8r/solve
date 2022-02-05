import React, { useMemo } from 'react';
import { Box, FlatList } from 'native-base';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';

export default function Graphs({ graphs }: { graphs: Graph[] }) {
  const { navigate } = useNavigation();
  const { width } = Dimensions.get('window');
  const columns = width < 400 ? 2 : 4;

  const onPress = (index: number) => {
    navigate('App', {
      screen: 'TabOne',
      params: { screen: 'Viewer', params: { graph: graphs[index] } }
    });
  };

  return (
    <Box style={styles.container} padding={0} p="5">
      <FlatList
        flex={1}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        numColumns={columns}
        data={Array(10)
          .fill(0)
          .map(() => ({}))}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ index }) => (
          <TouchableOpacity onPress={() => onPress(index)}>
            <Box
              bg="blueGray.200"
              p="2"
              rounded="sm"
              height="40"
              minWidth="40"
              marginRight="5"
              marginLeft="5"
              marginBottom="10"
            />
          </TouchableOpacity>
        )}
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
  listContent: {
    width: '100%',
    margin: 0,
    padding: 0,
    alignItems: 'center'
  }
});
