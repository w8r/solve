import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal } from 'native-base';
import { useFormik as useForm } from 'formik';
import { FormContainer } from './FormContainer';
import * as Validator from 'yup';

import {
  Button,
  Heading,
  VStack,
  HStack,
  Link,
  Text,
  FormControl,
  Input,
  Divider
} from 'native-base';

const NodeDialogSchema = Validator.object().shape({
  password: Validator.string()
    .min(6, 'Too short')
    .max(16, 'Too long')
    .required('Required'),
  email: Validator.string().email('Invalid email').required('Required')
});

export default function CreateNodeDialog({
  visibility,
  setVisibility
}: {
  visibility: boolean;
  setVisibility: (visibility: boolean) => void;
}) {
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      validationSchema: NodeDialogSchema,
      initialValues: { email: '', password: '' },
      onSubmit: (values) => {}
    });

  const nodeNameRef = useRef<any>(null);
  return (
    <Modal
      isOpen={visibility}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      isKeyboardDismissable={true}
      animationPreset="slide"
      avoidKeyboard={true}
      closeOnOverlayClick={true}
    >
      <View style={styles.bottomNavigationView}>
        <Text style={styles.closeButton} onPress={() => setVisibility(false)}>
          Close
        </Text>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <FormContainer>
            <Heading size="md" fontWeight="400" color="coolGray.800">
              Add a new node
            </Heading>
            <VStack space={3} mt="5">
              <FormControl>
                <FormControl.Label
                  _text={{
                    color: 'coolGray.800',
                    fontSize: 'xs',
                    fontWeight: 500
                  }}
                >
                  Name
                </FormControl.Label>
                <Input
                  onBlur={handleBlur('name')}
                  onSubmitEditing={() => nodeNameRef.current?.focus()}
                />
              </FormControl>
              <Button
                mt="2"
                colorScheme="indigo"
                _text={{ color: 'white' }}
                onPress={() => submitForm()}
              >
                Add
              </Button>
            </VStack>
            <Divider my="2" />
          </FormContainer>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: '#fff',
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // top right corner css
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#fff'
  }
});
