import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu } from 'native-base';
import { AntDesign as Icons } from '@expo/vector-icons';
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
  const { app, startSelection, setIsSelecting } = useVis();
  const onSelect = () => {
    setIsSelecting(true);
    startSelection((graph) => {
      setIsSelecting(false);
      if (graph && graph.nodes.length > 0) onPreview(graph);
    });
  };
  return (
    <Menu
      w="160"
      shouldOverlapWithTrigger={false}
      placement="top"
      trigger={(triggerProps) => {
        return (
          <Fab
            renderInPortal={false}
            shadow={2}
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
      <Menu.Item onPress={onRemove}>Remove</Menu.Item>
      <Menu.Item onPress={onEdit}>Edit</Menu.Item>
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
  }
});
