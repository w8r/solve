import React, { FC, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu, Text, HStack } from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { useVis } from '../../../../components/Viewer';
import { isWeb } from '../../../../constants/device';

interface ProblemMenuProps {
  showDialog: () => void;
  onSelect: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onCreateEdge: () => void;
  onShare: () => void;
  onSelectClear: () => void;
  onSave: () => void;
}

export const ProblemMenu: FC<ProblemMenuProps> = ({
  showDialog,
  onSelect,
  onRemove,
  onEdit,
  onCreateEdge,
  onShare,
  onSelectClear,
  onSave
}) => {
  const { graph, selectedEdges, selectedNodes } = useVis();
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
      active: selectedNodes.length > 0 || selectedEdges.length > 0
    },
    {
      icon: 'crop',
      onPress: onSelect,
      text: 'Select',
      active: graph.nodes.length > 0 && !graph.data?.shared
    },
    {
      icon: 'crop',
      onPress: onSelectClear,
      text: 'Clear selection',
      active: selectedNodes.length + selectedEdges.length > 0
    },
    {
      icon: 'share',
      onPress: onShare,
      text: 'Share',
      active: selectedNodes.length > 0 && !graph.data?.shared
    },
    {
      icon: 'save',
      onPress: onSave,
      text: 'Save',
      active: graph.nodes.length + graph.edges.length > 0
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
    marginLeft: isWeb ? -80 : 0
  }
});
