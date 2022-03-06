import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { VStack, Text, Image, FlatList } from 'native-base';
import { getGraphPreviewURL, SubgraphHeader } from '../../services/api';

export const List: FC<{ graphs: SubgraphHeader[] }> = ({ graphs }) => {
  if (graphs.length === 0)
    return <Text style={styles.message}>No subgraphs yet</Text>;
  return (
    <VStack>
      <Text style={styles.header}>Subgraphs</Text>
      <FlatList
        data={graphs}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item: graph }) => {
          return (
            <VStack>
              <Text style={styles.nameText}>{graph.name}</Text>
              <Image
                style={styles.image}
                alt={graph.id}
                source={{
                  uri: getGraphPreviewURL(graph.publicId) + `?${Date.now()}`
                }}
                width="80"
                height="80"
              />
            </VStack>
          );
        }}
      />
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {},
  nameText: {},
  image: {},
  message: {}
});
