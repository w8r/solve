import React from 'react';
import { Heading } from 'native-base';
import { FormContainer } from '../components';
import { SignupProps } from '../navigation/types';

export default function Signup({ navigation }: SignupProps) {
  return (
    <FormContainer>
      <Heading>Sign up</Heading>
    </FormContainer>
  );
}
