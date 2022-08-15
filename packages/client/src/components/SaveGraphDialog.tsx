import React, { FC, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, IconButton, Input, Spinner } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { Graph } from '../types/graph';
import { useVis } from './Viewer';
import { saveGraph, shareGraph } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

interface SaveGraphDialogProps {
  onCancel: () => void;
  onDone: () => void;
  share?: boolean;
}

export const SaveGraphDialog: FC<SaveGraphDialogProps> = ({
  onCancel,
  onDone,
  share = false
}) => {
  const { graph, setGraph } = useVis();
  const { user } = useAuth();
  const [value, setValue] = useState(graph.name || '');
  const [isLoading, setLoading] = useState(false);
  const navigation = useNavigation();
  const handleChange = (text: string) => setValue(text);

  // TODO: Add validation
  const onPressSave = () => {
    graph.name = value;
    setGraph(graph);
    setLoading(true);

    console.log(
      'Saving graph...',
      graph.nodes.map((n) => n.attributes.selected)
    );

    const graphToSave = {
      ...graph,
      nodes: graph.nodes.map((n) => {
        return { ...n, attributes: { ...n.attributes, selected: false } };
      }),
      edges: graph.edges.map((e) => {
        return { ...e, attributes: { ...e.attributes, selected: false } };
      })
    };

    if (!share && graph.user && graph.user._id !== user.uuid) {
      graphToSave.data!.parentId = graph.publicId;
    }

    const request = share
      ? shareGraph(graphToSave, graph.publicId)
      : saveGraph(
          graph.publicId
            ? graph.user && graph.user!._id !== user.uuid
              ? null
              : graph.publicId
            : null,
          graphToSave
        );

    return request
      .then((resp) => {
        setGraph({ ...resp, nodes: graph.nodes, edges: graph.edges });
        navigation.setParams({ graph: resp.publicId });
        setTimeout(onDone, 500);
      })
      .catch((err) => setLoading(false));
  };
  return (
    <Modal isOpen>
      <Modal.Content>
        <Modal.Header>Save</Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <Spinner />
          ) : (
            <Input
              onChangeText={handleChange}
              value={value}
              placeholder={graph.name || 'Graph name'}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            disabled={isLoading}
            onPress={onCancel}
            _icon={{ as: Icons, name: 'x' }}
            style={styles.cancelButton}
          />
          <IconButton
            disabled={isLoading}
            _icon={{ as: Icons, name: 'check' }}
            onPress={onPressSave}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    flex: 1,
    alignSelf: 'flex-start'
  }
});
