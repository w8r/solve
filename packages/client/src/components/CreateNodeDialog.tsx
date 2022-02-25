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
  setVisibility,
  addNode
}: {
  visibility: boolean;
  setVisibility: (visibility: boolean) => void;
  addNode: (name: string, category: string, size: number) => void;
}) {
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      validationSchema: NodeDialogSchema,
      initialValues: { selectedTag: '', name: '', size: 2 },
      onSubmit: (values) => {
        addNode(values.name, values.selectedTag, onChangeValue);
      }
    });

  const [onChangeValue, setOnChangeValue] = React.useState(10);

  const nodeNameRef = useRef<any>(null);
  const tagRef = useRef<string[]>(null);
  let tags = [];
  if (visibility) {
    return (
      <BottomDrawer
        initialState={DrawerState.Peek + 100}
        onDrawerStateChange={(e) => null}
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
