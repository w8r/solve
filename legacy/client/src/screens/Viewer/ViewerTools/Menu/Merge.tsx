import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu, Text, HStack } from 'native-base';
import {
  MaterialCommunityIcons as MCIcon,
  Feather as FeatherIcon
} from '@expo/vector-icons';
import { menuMargin } from '../../../../constants/Layout';

interface MergeMenuProps {
  onMerge: () => void;
}

export const MergeMenu: FC<MergeMenuProps> = ({ onMerge }) => {
  const menuItems = [
    {
      icon: 'check-circle',
      onPress: onMerge,
      text: 'Solve',
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
            icon={
              <Icon color="white" as={FeatherIcon} name="circle" size="4" />
            }
          />
        );
      }}
    >
      {menuItems.map((item, index) =>
        item.active ? (
          <Menu.Item key={index} onPress={item.onPress}>
            <HStack space="3">
              <Icon as={MCIcon} name={item.icon} size="sm" />
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
