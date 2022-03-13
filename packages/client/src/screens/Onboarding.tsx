import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { OnboardingProps } from '../navigation/types';
import { Text, VStack, Center } from 'native-base';
import { FormContainer, Logo } from '../components';
import { tintColorLight } from '../constants/Colors';

export default function Onboarding({ navigation }: OnboardingProps) {
  return (
    <FormContainer>
      <VStack space="3" mt="10">
        <Center>
          <Logo />
          <Text>Distributed problem solving</Text>
        </Center>
        <VStack space="2" marginTop="10">
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text color={tintColorLight}>Sign in &rarr;</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text color={tintColorLight}>Sign up &rarr;</Text>
          </TouchableOpacity>
        </VStack>
      </VStack>
    </FormContainer>
  );
}
