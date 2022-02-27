import React, { FC, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, IconButton, Input, Spinner } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { Graph } from '../../types/graph';
import { useVis } from '../../components/Viewer';
import { saveGraph } from '../../services/api';

interface SaveGraphDialogProps {
  onCancel: () => void;
  onDone: () => void;
}

export const SaveGraphDialog: FC<SaveGraphDialogProps> = ({
  onCancel,
  onDone
}) => {
  const { graph, setGraph } = useVis();
  const [value, setValue] = useState(graph.name || '');
  const [isLoading, setLoading] = useState(false);
  const handleChange = (text: string) => setValue(text);
  // TODO: Add validation
  const onPressSave = () => {
    graph.name = value;
    setGraph(graph);
    setLoading(true);
    return saveGraph(graph.publicId ? graph.publicId : null, graph)
      .then((resp) => {
        setGraph(resp);
        setTimeout(onDone, 500);
      })
      .catch(() => setLoading(false));
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
