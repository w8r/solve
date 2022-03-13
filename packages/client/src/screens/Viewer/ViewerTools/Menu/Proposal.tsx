import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Fab, Icon, Menu, Text, HStack } from 'native-base';
import {
  Octicons as OctIcon,
  MaterialCommunityIcons as MCIcon,
  Feather as FeatherIcon
} from '@expo/vector-icons';

interface ProposalMenuProps {
  onComment?: () => void;
  onAccept: () => void;
}

export const ProposalMenu: FC<ProposalMenuProps> = ({
  onComment,
  onAccept
}) => {
  const menuItems = [
    {
      icon: 'comment',
      onPress: onComment,
      text: 'Comment',
      active: false
    },
    {
      icon: 'check',
      onPress: onAccept,
      text: 'Accept',
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
              <Icon
                as={item.icon === 'comment' ? OctIcon : MCIcon}
                name={item.icon}
                size="sm"
              />
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
