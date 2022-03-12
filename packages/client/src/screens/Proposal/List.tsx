import React, { FC } from 'react';
import { StyleSheet, SectionList, View } from 'react-native';
import { VStack, Text, Image, Box, Icon, HStack } from 'native-base';
import { Entypo as Icons } from '@expo/vector-icons';
import { getGraphPreviewURL, GraphProposals } from '../../services/api';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';

export const List: FC<{
  proposals: GraphProposals;
  subgraph: string;
  Header: FC;
}> = ({ proposals, subgraph, Header }) => {
  const { navigate } = useNavigation();
  const onPress = (index: number) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: {
          graph: proposals.forks[index].publicId,
          viewerMode: 'proposal',
          subgraph: subgraph
        }
      }
    });
  };

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      sections={
        proposals.forks.length === 0
          ? []
          : [{ title: 'Proposals', data: proposals.forks }]
      }
      keyExtractor={(_, index) => index.toString()}
      renderSectionHeader={() => (
        <View style={styles.subHeader}>
          <Icon as={Icons} name="flow-line" />
        </View>
      )}
      ListHeaderComponent={Header}
      ListEmptyComponent={() => (
        <View style={styles.emptyMessage}>
          <Text style={styles.messageText}>No proposals yet</Text>
        </View>
      )}
      renderItem={({ item: graph, index }) => {
        return (
          <TouchableOpacity onPress={() => onPress(index)}>
            <VStack style={styles.card}>
              <View>
                <Image
                  style={styles.image}
                  alt={graph.id}
                  size="2xl"
                  source={{
                    uri: getGraphPreviewURL(graph.publicId) + `?${Date.now()}`
                  }}
                />
              </View>
              <HStack style={styles.caption}>
                <Text style={styles.nameText}>Proposal: </Text>
                <Text>{graph.name}</Text>
              </HStack>
            </VStack>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },

  listContent: {
    margin: 0,
    padding: 0,
    width: '100%',
    paddingBottom: 60,
    alignItems: 'center'
  },

  subHeader: {
    marginTop: 25,
    marginBottom: 25
  },

  card: {
    flex: 1,
    padding: 10
  },

  header: {
    marginTop: 20,
    marginBottom: 10
  },
  nameText: {
    fontWeight: 'bold'
  },
  image: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)'
  },

  caption: {
    paddingTop: 10
  },

  icon: {
    marginRight: 8
  },

  emptyMessage: {
    paddingTop: 40
  },

  messageText: {
    color: 'rgba(0,0,0,0.2)'
  }
});
