import { API_URL } from '@env';
import React, { useState } from 'react';
import * as api from '../../../services/api';
import { StyleSheet } from 'react-native';
import { useVis } from '../../../components/Viewer';
import { MergeMenu } from './Menu/Merge';
import { Icon, Text, View } from 'native-base';
import { MaterialCommunityIcons as Icons } from '@expo/vector-icons';

interface MergeProps {
  subgraph?: string;
}
export function MergeTools({ subgraph }: MergeProps) {
  const { graph, setGraph } = useVis();
  const [merged, setMerged] = useState(false);
  console.log(subgraph);

  const onMerge = async () => {
    await api.resolveGraph(subgraph!, { ...graph, resolved: true });
    setGraph({ ...graph, resolved: true });
    setMerged(true);
    setTimeout(() => {
      setMerged(false);
    }, 2500);
  };

  return (
    <>
      <MergeMenu onMerge={onMerge} />
      {merged && (
        <View style={styles.container}>
          <Icon as={Icons} name="merge" size="xl" />
          <Text style={styles.textStyle}>MERGED</Text>
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
