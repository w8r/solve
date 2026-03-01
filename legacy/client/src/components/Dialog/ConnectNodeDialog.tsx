import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Slider } from 'native-base';
import { useFormik as useForm } from 'formik';
import { FormContainer } from '../FormContainer';
import * as Validator from 'yup';
import TagGroup from '../TagGroup';

import {
  Button,
  Heading,
  VStack,
  Text,
  FormControl,
  Input,
  Divider
} from 'native-base';
import { GraphNode } from '../../types/graph';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface Tag {
  id: number;
  label: string;
}

export default function CreateNodeDialog({
  closeDialog,
  createEdge,
  data
}: {
  closeDialog: () => void;
  createEdge: (sourceId: string, targetId: string) => void;
  data: [GraphNode, GraphNode] | null;
}) {
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      initialValues: {},
      onSubmit: (values) => {}
    });

  return (
    <Modal
      avoidKeyboard={true}
      isOpen={true}
      justifyContent="flex-end"
      bottom="4"
      size="lg"
    >
      <Modal.Content maxWidth="350" style={styles.bottomNavigationView}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => closeDialog()}
        >
          <Text>Close</Text>
        </TouchableOpacity>
        <FormContainer>
          <Heading size="md" fontWeight="400" color="coolGray.800">
            Connect Nodes
          </Heading>
          <VStack direction="column" space="2.5" mt="7">
            <Button
              mt="2"
              colorScheme="indigo"
              _text={{ color: 'white' }}
              onPress={() => submitForm()}
            >
              Connect
            </Button>
          </VStack>
          <Divider my="2" />
        </FormContainer>
      </Modal.Content>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: '#fff',
    width: '100%',
    height: 600,
    justifyContent: 'center'
  },
  // top right corner css
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10
  }
});
