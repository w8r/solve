import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { VStack, Text, Image } from 'native-base';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';

export const Header: FC<{ graph: Graph }> = ({ graph }) => {
  return (
    <VStack style={styles.container}>
      <Text style={styles.headerText}>{graph.name}</Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerText: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 20,
    top: 200,
    textAlign: 'center',
    marginTop: 20
  },
  image: {
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1
  }
});
