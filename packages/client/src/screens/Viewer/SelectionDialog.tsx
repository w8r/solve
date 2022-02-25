import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Text, IconButton } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';

interface SelectionDialogProps {
  visible: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

export const SelectionDialog: FC<SelectionDialogProps> = ({
  visible,
  onProceed,
  onCancel
}) => {
  return (
    <Modal
      isOpen={visible}
      avoidKeyboard
      justifyContent="flex-end"
      bottom="4"
      size="lg"
    >
      <Modal.Content>
        <Modal.Footer style={{ alignContent: 'flex-start' }}>
          <IconButton
            style={styles.leftButton}
            _icon={{ as: Icons, name: 'x' }}
            title="Cancel"
            onPress={onCancel}
            width="5"
          />
          <Text style={styles.text}>Continue?</Text>
          <IconButton
            style={styles.rightButton}
            _icon={{ as: Icons, name: 'arrow-right' }}
            title="Continue"
            onPress={onProceed}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 10
  },
  leftButton: {
    flex: 1,
    marginRight: 10,
    alignItems: 'flex-start'
  },
  rightButton: {
    flex: 1,
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    marginLeft: 10
  }
});
