import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { OnboardingProps } from '../navigation/types';
import { Text, Heading, VStack } from 'native-base';
import { FormContainer } from '../components';

export default function Onboarding({ navigation }: OnboardingProps) {
  return (
    <FormContainer>
      <Heading size="lg" fontWeight="600" color="coolGray.800">
        Onboarding screen
      </Heading>
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
