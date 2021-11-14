import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { OnboardingProps } from '../navigation/types';
import { Text, VStack } from 'native-base';
import { FormContainer, Logo } from '../components';

export default function Onboarding({ navigation }: OnboardingProps) {
  return (
    <FormContainer>
      <Logo />
      <VStack space={3} mt="5">
        <Text>Some beautiful words about the app</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text>Sign in &rarr;</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text>Sign up &rarr;</Text>
        </TouchableOpacity>
      </VStack>
    </FormContainer>
  );
}
