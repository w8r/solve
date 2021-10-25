import React from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StackNavigationProps } from '../navigation/AppRoutes';
import { AuthRoutes, RootStackParamList } from '../navigation/types';

export default function Onboarding({
  navigation
}: StackNavigationProps<AuthRoutes, 'Onboarding'>) {
  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}
