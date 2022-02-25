import React, { SetStateAction, useRef, useState } from 'react';
import { Platform, LogBox, StyleSheet, View } from 'react-native';
import { Modal, Slider } from 'native-base';
import { useFormik as useForm } from 'formik';
import { FormContainer } from './FormContainer';
import * as Validator from 'yup';
import TagGroup from './TagGroup';

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
import { BottomDrawer, DrawerState } from './BottomDrawer';
import { GraphNode } from '../types/graph';

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

const NodeDialogSchema = Validator.object().shape({});

export interface Tag {
  id: number;
  label: string;
}

if (LogBox && Platform && Platform.OS !== 'web') {
  LogBox.ignoreLogs(['Cannot update a']);
}

export default function CreateNodeDialog({
  visibility,
  closeDialog,
  addNode,
  editNode,
  data
}: {
  visibility: boolean;
  closeDialog: () => void;
  addNode: (name: string, category: string, size: number) => void;
  editNode: (name: string, category: string, size: number) => void;
  data: GraphNode | null;
}) {
  console.log('data', data);
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      validationSchema: NodeDialogSchema,
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
  if (visibility) {
    return (
      <BottomDrawer
        initialState={DrawerState.Peek + 100}
        onDrawerStateChange={(e) => null}
      >
        <View style={styles.bottomNavigationView}>
          <Text style={styles.closeButton} onPress={() => closeDialog()}>
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
                {data ? 'Edit node' : 'Add a new node'}
              </Heading>
              <VStack space={4} mt="7">
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
                  Add
                </Button>
              </VStack>
              <Divider my="2" />
            </FormContainer>
          </View>
        </View>
      </BottomDrawer>
    );
  } else {
    return <View></View>;
  }
}

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: '#fff',
    width: '100%',
    height: 450,
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
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  }
});
