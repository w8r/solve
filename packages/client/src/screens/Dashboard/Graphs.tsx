import React, { PropsWithChildren, ReactElement } from 'react';
import {
  Badge,
  Box,
  FlatList,
  HStack,
  Icon,
  Image,
  SectionList,
  Text,
  View
} from 'native-base';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';
import { Feather as Icons } from '@expo/vector-icons';

export interface GraphsWithSections {
  title: 'Root Graphs' | 'Subgraphs';
  data: Array<{ graphs: Graph[] }>;
}

export default function Graphs({
  graphs,
  emptyComponent
}: PropsWithChildren<{
  graphs: GraphsWithSections[];
  emptyComponent: ReactElement;
}>) {
  const { navigate } = useNavigation();
  const { width } = Dimensions.get('window');
  const columns = width < 400 ? 2 : 4;

  // A method for renderItem prop of SectionList which returns a FlatList of Graphs
  const renderItem = ({
    index,
    item: graph
  }: {
    index: number;
    item: Graph;
  }) => {
    return (
      <TouchableOpacity onPress={() => onPress(graph.id)}>
        <Box
          rounded="sm"
          minWidth="40"
          maxWidth="40"
          marginRight={(index + 1) % columns === 0 ? 0 : 5}
          marginBottom={5}
        >
          <Image
            style={styles.image}
            alt={graph.id}
            source={{
              uri: getGraphPreviewURL(graph.id) + `?${Date.now()}`
            }}
            width="40"
            height="40"
          />
          <HStack
            marginTop="2"
            space="2"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text flexShrink={1} maxWidth={40}>
              {graph.name || 'Graph name'}
            </Text>
            <TouchableOpacity onPress={() => onBadgePress(graph.id)}>
              <Badge marginLeft="3" rounded="md" flexDirection="row">
                <Icon as={Icons} name="git-branch" size="3" marginRight="1" />
                {graph.forks}
              </Badge>
            </TouchableOpacity>
          </HStack>
        </Box>
      </TouchableOpacity>
    );
  };

  // This function is used to render flatlist from renderItem prop of SectionList
  const renderFlatList = ({
    item,
    index
  }: {
    item: { graphs: Graph[] };
    index: number;
  }) => {
    if (item.graphs.length === 0) return emptyComponent;
    return (
      <FlatList
        contentContainerStyle={{ ...styles.listContent, paddingBottom: 100 }}
        data={item.graphs}
        keyExtractor={(_, index) => index.toString()}
        numColumns={columns}
        renderItem={renderItem}
      />
    );
  };

  const onPress = (graphId: string) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Viewer',
        params: graphId ? { viewerMode: 'problem', graph: graphId } : undefined
      }
    });
  };

  const onBadgePress = (graphId: string) => {
    navigate('App', {
      screen: 'TabOne',
      params: {
        screen: 'Graph',
        params: { graph: graphId }
      }
    });
  };

  return (
    <SectionList
      contentContainerStyle={styles.sectionContent}
      sections={graphs}
      ListEmptyComponent={emptyComponent}
      style={styles.list}
      renderSectionHeader={({ section }) =>
        section.data.length > 0 ? (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        ) : null
      }
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderFlatList}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 0,
    paddingTop: 40
  },
  list: {
    flexWrap: 'wrap',
    flex: 1,
    width: '100%'
  },
  listContent: {
    padding: 0,
    flex: 1,
    alignItems: 'center',
    width: '100%'
  },
  sectionContent: {
    padding: 0,
    flex: 1,
    alignItems: 'center',
    width: '100%'
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  textStyle: {},
  image: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  }
});
