import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StackNavigationProps } from '../navigation/AppRoutes';
import {
  AuthRoutes,
  OnboardingProps,
  RootStackParamList
} from '../navigation/types';
import {
  Container,
  Text,
  Heading,
  NativeBaseProvider,
  Center
} from 'native-base';

export default function Onboarding({ navigation }: OnboardingProps) {
  return (
    <Container>
      <Heading>
        A component library for the
        <Heading color="emerald.500"> React Ecosystem</Heading>
      </Heading>
      <Text mt="3" fontWeight="medium">
        NativeBase is a simple, modular and accessible component library that
        gives you building blocks to build you React applications.
      </Text>
      <Text>Onboarding</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text>Sign up</Text>
      </TouchableOpacity>
    </Container>
  );
}
