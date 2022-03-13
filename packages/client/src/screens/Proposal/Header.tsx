import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, Icon, Image, Button } from 'native-base';
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
        params: { graph: graph.publicId, mode: 'edit' }
      }
    });
  };
  const onMerge = () => {
    console.log('merge', graph);
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: {
          graph: graph.publicId,
          subgraph: graph.publicId,
          mode: 'merge'
        }
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
        <Button style={styles.buttonStyle} onPress={onMerge}>
          <Text style={styles.buttonTextStyle}>Merge solution</Text>
        </Button>
      </TouchableOpacity>
      <VStack>
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
        <Text style={styles.proposalTitle}>Proposals</Text>
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  // style for button half width of image green little below
  buttonStyle: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: '#00b894',
    borderRadius: 10,
    borderWidth: 1,
    alignContent: 'center',
    borderColor: '#00b894'
  },
  // style for text half width of image
  buttonTextStyle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  container: {
    width: '100%',
    alignItems: 'center'
  },
  // style for icon and text in header next to each other on same line
  iconStyle: {
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20
  },
  // style for text next to icon
  textStyle: {
    alignSelf: 'center',
    fontSize: 16,
    marginBottom: 10
  },
  proposalTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  headerText: {
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
