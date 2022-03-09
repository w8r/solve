import { API_URL } from '@env';
import React, { useState } from 'react';
import * as api from '../../../services/api';
import {StyleSheet} from 'react-native';
import { useVis } from '../../../components/Viewer';
import { ProposalMenu } from './Menu/Proposal';
import { Icon, Text, View } from 'native-base';
import {  MaterialCommunityIcons as Icons
} from '@expo/vector-icons';

interface ProposalProps {
  subgraph?: string;
}
export function ProposalTools({subgraph}: ProposalProps) {
  const { graph, setGraph } = useVis();
  const [accepted, setAccepted] = useState(false);
  console.log(subgraph);

  const onAccept = async () => {
    console.log(subgraph);
    await api.resolveGraph(subgraph!, {...graph, resolved: true});
    setGraph({...graph, resolved: true}); 
    setAccepted(true);
    setTimeout(() => {
      setAccepted(false);
    } , 2500);
  };

  return (
    <>
      <ProposalMenu onAccept={onAccept} />
      {accepted && <View style={styles.container}> 
        <Icon as={Icons} color='green.700' name="check" size='xl' /> 
        <Text style={styles.textStyle}>ACCEPTED</Text>
          </View>}
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
      height: 2,
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
  },
});