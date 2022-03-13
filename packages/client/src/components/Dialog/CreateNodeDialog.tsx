import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Slider } from 'native-base';
import { useFormik as useForm } from 'formik';
import { FormContainer } from '../FormContainer';
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
import {
  CategoryColors,
  GraphNode,
  getCategoryColor,
  categoryArray
} from '../../types/graph';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { isWeb } from '../../constants/device';

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
  const [categoryColor, setCategoryColor] = useState(CategoryColors.Happiness);
  useEffect(() => {
    setOnChangeValue(getClosestSize((data?.attributes.r || 3) * 3));
  }, [data]);
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      initialValues: {
        selectedTag: data ? data.data?.category || '' : '',
        name: data ? data.attributes.text || '' : '',
        size: data ? getClosestSize(data.attributes.r * 3) : 3
      },
      onSubmit: (values) => {
        if (data) {
          editNode(
            values.name,
            values.selectedTag as string,
            Math.floor(onChangeValue / 3)
          );
        } else {
          addNode(
            values.name,
            values.selectedTag as string,
            Math.floor(onChangeValue / 3)
          );
        }
      }
    });

  const [onChangeValue, setOnChangeValue] = useState(data?.attributes.r || 10);

  const nodeNameRef = useRef<any>(null);

  return (
    <Modal
      avoidKeyboard={true}
      isOpen={true}
      justifyContent="flex-end"
      bottom="4"
      size="lg"
      onClose={closeDialog}
    >
      <Modal.Content
        maxWidth={isWeb ? 500 : undefined}
        style={styles.bottomNavigationView}
      >
        <Modal.CloseButton />
        <FormContainer>
          <VStack direction="column" mt="10" space="2.5">
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
                onChange={(evt) => handleChange('name')(evt.nativeEvent.text)}
                onBlur={() => handleBlur('name')}
                placeholder="What is wrong?"
                autoCompleteType="off"
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
                  setTimeout(() => {
                    handleChange('selectedTag')(tag);
                    setCategoryColor(getCategoryColor(tag));
                  }, 0)
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
                Importance
              </FormControl.Label>
              <Slider
                defaultValue={(data?.attributes.r || 3) * 10}
                onChange={(size) => {
                  setOnChangeValue(getClosestSize(Math.floor(size / 5)));
                }}
                colorScheme={categoryColor}
              >
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb size={onChangeValue} />
              </Slider>
            </FormControl>
            <Button
              mt="8"
              colorScheme="indigo"
              _text={{ color: 'white' }}
              onPress={() => submitForm()}
            >
              {data ? 'Done' : 'Add'}
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
    justifyContent: 'center'
  },
  // top right corner css
  closeButton: {
    padding: 10,
    borderWidth: 1,
    alignSelf: 'flex-end'
  }
});
