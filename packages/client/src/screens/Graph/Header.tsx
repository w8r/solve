import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, Image } from 'native-base';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

export const Header: FC<{ graph: Graph }> = ({ graph }) => {
  const { navigate } = useNavigation();
  const onPress = () => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: { graph: graph.publicId }
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
      </TouchableOpacity>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  headerText: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 20,
    top: 200,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  image: {
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1
  }
});
