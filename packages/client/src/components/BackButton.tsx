import React, { FC } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Badge, Icon } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { isWeb } from '../constants/device';
import { Feather as Icons } from '@expo/vector-icons';

export const BackButton: FC = () => {
  const { canGoBack, goBack } = useNavigation();
  if (!canGoBack()) return null;
  return (
    <TouchableOpacity onPress={() => goBack()} style={styles.container}>
      <Icon as={Icons} name="arrow-left" style={styles.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20 + (isWeb ? 0 : 20),
    left: 20 + (isWeb ? 20 : 0),
    alignContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  icon: {
    width: 32,
    height: 32
  }
});
