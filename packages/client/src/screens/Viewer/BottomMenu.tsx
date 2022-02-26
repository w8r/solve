import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu, Text, HStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { useVis } from '../../components/Viewer';

interface BottomMenuProps {
  showDialog: () => void;
  onSelect: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onCreateEdge: () => void;
  onShare: () => void;
}

export const BottomMenu: FC<BottomMenuProps> = ({
  showDialog,
  onSelect,
  onRemove,
  onEdit,
  onCreateEdge,
  onShare
}) => {
  const { selectedEdges, selectedNodes } = useVis();

  const menuItems = [
    {
      icon: 'plus-circle',
      onPress: showDialog,
      text: 'Add node',
      active: selectedNodes.length === 0
    },
    {
      icon: 'copy',
      onPress: onCreateEdge,
      text: 'Create edge(s)',
      active: selectedNodes.length > 1
    },
    {
      icon: 'edit',
      onPress: onEdit,
      text: 'Edit',
      active: selectedNodes.length + selectedEdges.length === 1
    },
    {
      icon: 'trash-2',
      onPress: onRemove,
      text: 'Remove',
      active: selectedNodes.length > 0
    },
    {
      icon: 'crop',
      onPress: onSelect,
      text: 'Select',
      active: true
    },
    {
      icon: 'share',
      onPress: onShare,
      text: 'Share',
      active: selectedNodes.length > 0
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
    marginBottom: 15
  }
});
