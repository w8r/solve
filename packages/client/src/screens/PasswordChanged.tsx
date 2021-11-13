import React from 'react';
import { Button, Heading, VStack, HStack, Text } from 'native-base';
import { FormContainer } from '../components';
import { PasswordChangedProps } from '../navigation/types';

export default function PasswordChanged({ navigation }: PasswordChangedProps) {
  return (
    <FormContainer>
      <Heading>Password changed</Heading>
      <VStack space={3} mt="5">
        <HStack mt="6" justifyContent="center">
          <Text fontSize="sm" color="muted.700" fontWeight={400}>
            Your password has been reset, you can now log into your account.
          </Text>
        </HStack>
        <Button
          mt="2"
          colorScheme="indigo"
          _text={{ color: 'white' }}
          onPress={() => navigation.navigate('Login')}
        >
          Sign in
        </Button>
      </VStack>
    </FormContainer>
  );
}
