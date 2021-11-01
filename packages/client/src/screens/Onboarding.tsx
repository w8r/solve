import React from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StackNavigationProps } from '../navigation/AppRoutes';
import {
  AuthRoutes,
  OnboardingProps,
  RootStackParamList
} from '../navigation/types';

export default function Onboarding({ navigation }: OnboardingProps) {
  return (
    <View>
      <Text>Onboarding</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
