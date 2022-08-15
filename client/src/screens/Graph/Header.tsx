import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, Image } from 'native-base';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import ago from 's-ago';

export const Header: FC<{ graph: Graph }> = ({ graph }) => {
  const { navigate } = useNavigation();
  const onPress = () => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: { graph: graph.publicId, mode: 'edit' }
      }
    });
  };
  return (
    <VStack style={styles.container}>
      <Text style={styles.headerText}>{graph.name}</Text>
      <TouchableOpacity onPress={onPress}>
        <Image
          style={styles.image}
          alt={graph.id}
          resizeMode="cover"
          size="2xl"
          source={{
            uri: getGraphPreviewURL(graph.publicId) + `?${Date.now()}`
          }}
        />
        <Text fontSize="sm" color="#999">
          {ago(new Date(graph.updatedAt as string))}
        </Text>
      </TouchableOpacity>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center'
  },
  headerText: {
    alignSelf: 'center',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  image: {
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1
  }
});
