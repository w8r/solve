import React, { useEffect, useState } from 'react';
import * as api from '../../../services/api';
import { StyleSheet } from 'react-native';
import { useVis } from '../../../components/Viewer';
import { MergeMenu } from './Menu/Merge';
import { Icon, Text, View } from 'native-base';
import { MaterialCommunityIcons as Icons } from '@expo/vector-icons';
import { getPremergeGraph, mergeGraph } from '../../../types/graph';

export function MergeTools({ subgraph }: { subgraph: string }) {
  const { graph, setGraph } = useVis();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onMerge = async () => {
    const mergedGraph = mergeGraph(graph);
    // save the merged graph as a new version
    api.saveGraph(mergedGraph.publicId, mergedGraph).then(() => {
      setGraph(mergedGraph);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2500);
    });
  };

  useEffect(() => {
    api.getGraph(subgraph).then((subgraph) => {
      api.getGraph(subgraph.data?.parentId!).then((parent) => {
        setGraph(getPremergeGraph(parent, subgraph));
      });
    });
  }, []);

  return (
    <>
      <MergeMenu onMerge={onMerge} />
      {showSuccessModal && (
        <View style={styles.container}>
          <Icon as={Icons} name="merge" size="xl" />
          <Text style={styles.textStyle}>Done</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // container is a white box with cute borders
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'green',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  textStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginLeft: 10,
    marginTop: -5
  }
});
