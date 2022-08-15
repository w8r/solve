import React, { useRef, useState } from 'react';
import { FormControl, Heading, Input, VStack, Button } from 'native-base';
import {
  FormContainer,
  ResetPasswordForm,
  ResetPasswordToken
} from '../components';
import * as Validator from 'yup';
import { useFormik as useForm } from 'formik';
import * as api from '../services/api';
import { ResetPasswordProps } from '../navigation/types';

const PasswordRecoverySchema = Validator.object().shape({
  email: Validator.string().email('Invalid email').required('Required')
});

export default function ResetPassword({
  navigation,
  route
}: ResetPasswordProps) {
  const token = route.params ? route.params.token : null;
  return (
    <FormContainer>
      <Heading>Reset password</Heading>
      <VStack space={3} mt="5">
        {token ? (
          <ResetPasswordForm
            token={token}
            onSuccess={() => navigation.navigate('PasswordChanged')}
          />
        ) : (
          <ResetPasswordToken />
        )}
      </VStack>
    </FormContainer>
  );
}
