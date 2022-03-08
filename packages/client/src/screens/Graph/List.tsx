import React, { FC } from 'react';
import { StyleSheet, SectionList, View } from 'react-native';
import { VStack, Text, Image, Box, Icon, HStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { getGraphPreviewURL, SubgraphHeader } from '../../services/api';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

export const List: FC<{ graphs: SubgraphHeader[]; Header: FC }> = ({
  graphs,
  Header
}) => {
  const { navigate } = useNavigation();
  const onPress = (index: number) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: { graph: graphs[index].publicId }
      }
    });
  };

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      sections={
        graphs.length === 0 ? [] : [{ title: 'Subgraphs', data: graphs }]
      }
      keyExtractor={(_, index) => index.toString()}
      renderSectionHeader={() => (
        <View style={styles.subHeader}>
          <Icon as={Icons} name="arrow-down" />
        </View>
      )}
      ListHeaderComponent={Header}
      ListEmptyComponent={() => (
        <View style={styles.emptyMessage}>
          <Text style={styles.messageText}>No subgraphs yet</Text>
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
                <Icon
                  as={Icons}
                  name="git-branch"
                  size="xs"
                  style={styles.icon}
                />
                <Text style={styles.nameText}>{graph.name}</Text>
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

  nameText: {},

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
