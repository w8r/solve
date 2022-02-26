import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu, Text, HStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { useVis } from '../../components/Viewer';
import { Graph } from '../../types/graph';

interface BottomMenuProps {
  showDialog: () => void;
  onPreview: (graph: Graph) => void;
  onRemove: () => void;
  onEdit: () => void;
}

export const BottomMenu: FC<BottomMenuProps> = ({
  showDialog,
  onPreview,
  onRemove,
  onEdit
}) => {
  const { app, startSelection, setIsSelecting, selectedNodes } = useVis();
  const onSelect = () => {
    setIsSelecting(true);
    startSelection((graph) => {
      setIsSelecting(false);
      if (graph && graph.nodes.length > 0) onPreview(graph);
    });
  };

  const onSelectStart = () => {};

  const menuItems = [
    {
      icon: 'plus-circle',
      onPress: showDialog,
      text: 'Add node'
    },
    {
      icon: 'edit',
      onPress: onEdit,
      text: 'Edit'
    },
    {
      icon: 'trash-2',
      onPress: onRemove,
      text: 'Remove'
    },
    {
      icon: 'crop',
      onPress: onSelectStart,
      text: 'Select'
    },
    {
      icon: 'share',
      onPress: () => {},
      text: 'Share'
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
      {menuItems.map((item, index) => (
        <Menu.Item key={index} onPress={item.onPress}>
          <HStack space="3">
            <Icon as={Icons} name={item.icon} size="sm" />
            <Text>{item.text}</Text>
          </HStack>
        </Menu.Item>
      ))}
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
