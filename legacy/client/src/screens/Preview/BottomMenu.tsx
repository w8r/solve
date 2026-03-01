import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu, Text, HStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { useVis } from '../../components/Viewer';
import { menuMargin } from '../../constants/Layout';

interface BottomMenuProps {
  onEdit: () => void;
  onSave: () => void;
}

export const BottomMenu: FC<BottomMenuProps> = ({ onEdit, onSave }) => {
  const { selectedEdges, selectedNodes } = useVis();

  const menuItems = [
    {
      icon: 'edit',
      onPress: onEdit,
      text: 'Edit',
      active: selectedNodes.length + selectedEdges.length === 1
    },
    {
      icon: 'save',
      onPress: onSave,
      text: 'Save',
      active: true
    }
  ];

  return (
    <Menu
      w="160"
      shouldOverlapWithTrigger={false}
      placement="top"
      style={styles.menu}
      trigger={(triggerProps) => {
        return (
          <Fab
            renderInPortal={false}
            shadow={2}
            size="sm"
            {...triggerProps}
            style={styles.fab}
            icon={<Icon color="white" as={Icons} name="circle" size="4" />}
          />
        );
      }}
    >
      {menuItems.map((item, index) =>
        item.active ? (
          <Menu.Item key={index} onPress={item.onPress}>
            <HStack space="3">
              <Icon as={Icons} name={item.icon} size="sm" />
              <Text>{item.text}</Text>
            </HStack>
          </Menu.Item>
        ) : null
      )}
    </Menu>
  );
};

const styles = StyleSheet.create({
  fab: {
    flex: 1,
    position: 'absolute',
    bottom: 20,
    right: '50%',
    marginRight: -25
  },
  menu: {
    marginBottom: 15,
    marginLeft: menuMargin
  }
});
