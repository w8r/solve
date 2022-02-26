import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Slider } from 'native-base';
import { useFormik as useForm } from 'formik';
import { FormContainer } from './FormContainer';
import * as Validator from 'yup';
import TagGroup from './TagGroup';

import {
  Button,
  Heading,
  VStack,
  Text,
  FormControl,
  Input,
  Divider
} from 'native-base';
import { GraphNode } from '../types/graph';
import { TouchableOpacity } from 'react-native-gesture-handler';

const categoryArray = [
  'Money',
  'Health',
  'Relationship',
  'Meaning',
  'Happiness'
];

const possibleSizes = [3, 3.5, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20, 24];

const getClosestSize = (goal: number) => {
  return possibleSizes.reduce(function (prev: number, curr: number) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

export interface Tag {
  id: number;
  label: string;
}

export default function CreateNodeDialog({
  closeDialog,
  addNode,
  editNode,
  data
}: {
  closeDialog: () => void;
  addNode: (name: string, category: string, size: number) => void;
  editNode: (name: string, category: string, size: number) => void;
  data: GraphNode | null;
}) {
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      initialValues: {
        selectedTag: data ? data.data?.category || '' : '',
        name: data ? data.attributes.text || '' : '',
        size: data ? data.attributes.r : 3
      },
      onSubmit: (values) => {
        if (data) {
          editNode(
            values.name,
            values.selectedTag as string,
            Math.floor(onChangeValue / 2)
          );
        } else {
          addNode(
            values.name,
            values.selectedTag as string,
            Math.floor(onChangeValue / 2)
          );
        }
      }
    });

  const [onChangeValue, setOnChangeValue] = React.useState(
    data?.attributes.r || 10
  );

  const nodeNameRef = useRef<any>(null);
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
            {data ? 'Edit node' : 'Add a new node'}
          </Heading>
          <VStack direction="column" space="2.5" mt="7">
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
                onChange={(evt: any) =>
                  handleChange('name')(evt.nativeEvent.text)
                }
                onBlur={handleBlur('name')}
                value={values.name}
                onSubmitEditing={() => nodeNameRef.current?.focus()}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label
                _text={{
                  color: 'coolGray.800',
                  fontSize: 'xs',
                  fontWeight: 500
                }}
              >
                Categories
              </FormControl.Label>
              <TagGroup
                singleChoiceMode={true}
                source={categoryArray}
                selected={data?.data?.category || undefined}
                onSelectedTagChange={(tag: string) =>
                  handleChange('selectedTag')(tag)
                }
              />
            </FormControl>
            <FormControl>
              <FormControl.Label
                _text={{
                  color: 'coolGray.800',
                  fontSize: 'xs',
                  fontWeight: 500
                }}
              >
                Node Size
              </FormControl.Label>
              <Slider
                defaultValue={onChangeValue}
                onChange={(size) =>
                  setOnChangeValue(getClosestSize(Math.floor(size / 5)))
                }
                colorScheme="orange"
              >
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb size={onChangeValue} />
              </Slider>
            </FormControl>
            <Button
              mt="2"
              colorScheme="indigo"
              _text={{ color: 'white' }}
              onPress={() => submitForm()}
            >
              {data ? 'Edit' : 'Add'}
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
