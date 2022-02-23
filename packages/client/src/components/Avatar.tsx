import React, { FC } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar, Badge } from 'native-base';
import { useNavigation } from '@react-navigation/native';
//import { theme } from '../core/theme';
import { isWeb } from '../constants/device';
import { useAuth } from '../hooks/useAuth';
import { getShortName } from '../lib/user';

export const ProfileButton: FC = () => {
  //#084783;
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const onUserPress = () => navigate('App', { screen: 'TabTwo' });

  return (
    <TouchableOpacity onPress={onUserPress} style={styles.container}>
      <Avatar bg="blueGray.500" size="md">
        {getShortName(user)}
      </Avatar>
      <Badge rounded="lg" variant="subtle" style={styles.badge}>
        {user.score}
      </Badge>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20 + (isWeb ? 0 : 20),
    right: 20 + (isWeb ? 20 : 0),
    alignContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  badge: {
    marginTop: 5
  },
  icon: {
    width: 32,
    height: 32,
    backgroundColor: '#fff'
  },
  iconDark: {
    width: 32,
    height: 32,
    backgroundColor: '#fff'
  },
  score: {
    marginTop: 5,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  scoreDark: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold'
    //color: colors.primary
  }
});
