import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, Icon, Image } from 'native-base';
import { MaterialCommunityIcons as Icons } from '@expo/vector-icons';
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
      <Text style={styles.headerText}>Proposals for {graph.name}</Text>
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
        <>
          {
            <>
              <Icon
                style={styles.iconStyle}
                color={graph.resolved ? 'darkgreen' : 'black'}
                as={Icons}
                name={graph.resolved ? 'check' : 'clock-time-ten-outline'}
                size="sm"
              />
              <Text style={styles.textStyle}>
                {graph.resolved ? 'Solved' : 'Awaiting resolution'}
              </Text>
            </>
          }
        </>
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
  // style for icon and text in header next to each other on same line
  iconStyle: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'column',
    top: 200,
    textAlign: 'center',
    marginTop: 20
  },
  // style for text next to icon
  textStyle: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'column',
    fontSize: 16,
    top: 100,
    textAlign: 'center',
    marginBottom: 10
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
