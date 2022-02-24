import { StyleSheet } from 'react-native';
import { Center, Fab, Icon, Menu } from 'native-base';
import { AntDesign as Icons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { useVis } from '../../components/Viewer';

export const BottomMenu = ({showDialog}: {showDialog: () => void}) => {
  const { app } = useVis();
  const onSelect = () => {
    console.log(app);
  };
  return (
    <Center>
      <Menu
        w="160"
        shouldOverlapWithTrigger={false}
        placement="top"
        trigger={(triggerProps) => {
          return (
            <Fab
              renderInPortal={false}
              shadow={2}
              right={70}
              bottom={50}
              size="sm"
              {...triggerProps}
              style={styles.fab}
              icon={<Icon color="white" as={Icons} name="plus" size="4" />}
            />
          );
        }}
      >
        <Menu.Item onPress={showDialog}>Create node</Menu.Item>
        <Menu.Item onPress={onSelect}>Select</Menu.Item>
      </Menu>
    </Center>
  );
}

const styles = StyleSheet.create({
  fab: {
    flex: 1,
    position: 'absolute',
    bottom: 20,
    right: '50%'
  }
});
