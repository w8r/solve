import React, { useLayoutEffect } from 'react';
import { Box, FlatList } from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import { Graph } from '../../types/graph';

export default function Graphs({ graphs }: { graphs: Graph[] }) {
  const { width } = Dimensions.get('window');
  const columns = width < 400 ? 2 : 4;

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
