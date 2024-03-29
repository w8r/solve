import React, { useRef, useState } from 'react';

import {
  Button,
  Heading,
  VStack,
  HStack,
  Link,
  Text,
  FormControl,
  Input,
  Divider
} from 'native-base';
import * as Validator from 'yup';
import { useFormik as useForm } from 'formik';
import { LoginProps } from '../navigation/types';
import { SocialLogin } from '../components/SocialLogin';
import { FormContainer, Logo } from '../components';
import { useAuth } from '../hooks/useAuth';
import { redirectTo } from '../navigation/LinkingUtils';

const LoginSchema = Validator.object().shape({
  password: Validator.string()
    .min(6, 'Too short')
    .max(16, 'Too long')
    .required('Required'),
  email: Validator.string().email('Invalid email').required('Required')
});

export default function Login({ navigation }: LoginProps) {
  const passwordInputRef = useRef<any>(null);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      validationSchema: LoginSchema,
      initialValues: { email: '', password: '' },
      onSubmit: (values) => {
        setIsLoading(true);
        login(values.email, values.password).catch((err) => {
          if (err && err.error) {
            const {
              error: { code, message }
            } = err;
            // TODO: store globally

            if (code === 'auth/wrong-password') errors.password = message;
            if (
              code === 'auth/email-unverified' ||
              code === 'auth/user-not-found'
            )
              errors.email = message;
          }
          setIsLoading(false);
        });
      }
    });

  const emailError = !!(errors.email && touched.email);
  const passwordError = !!(errors.password && touched.password);

  return (
    <FormContainer>
      <Logo />
      <Heading size="lg" fontWeight="600" color="coolGray.800">
        Login
      </Heading>
      <VStack space={3} mt="5">
        <FormControl isInvalid={emailError}>
          <FormControl.Label
            isDisabled={isLoading}
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Email
          </FormControl.Label>
          <Input
            isDisabled={isLoading}
            onChange={(evt) => handleChange('email')(evt.nativeEvent.text)}
            onBlur={handleBlur('email')}
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
          <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={passwordError}>
          <FormControl.Label
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Password
          </FormControl.Label>
          <Input
            isDisabled={isLoading}
            type="password"
            ref={passwordInputRef}
            onChange={(evt) => handleChange('password')(evt.nativeEvent.text)}
            onBlur={handleBlur('password')}
            onSubmitEditing={() => submitForm()}
          />
          <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
          <Link
            _text={{
              fontSize: 'xs',
              fontWeight: '500',
              color: 'indigo.500'
            }}
            alignSelf="flex-end"
            mt="1"
            onPress={() => redirectTo('auth/reset-password')}
          >
            Forgot Password?
          </Link>
        </FormControl>
        <Button
          isLoading={isLoading}
          mt="2"
          colorScheme="indigo"
          _text={{ color: 'white' }}
          onPress={() => submitForm()}
        >
          Sign in
        </Button>
        <HStack mt="6" justifyContent="center">
          <Text fontSize="sm" color="muted.700" fontWeight={400}>
            I'm a new user.{' '}
          </Text>
          <Link
            _text={{
              color: 'indigo.500',
              fontWeight: 'medium',
              fontSize: 'sm'
            }}
            onPress={() => redirectTo('auth/signup')}
          >
            Sign Up
          </Link>
        </HStack>
      </VStack>
      <Divider my="2" />
      <SocialLogin />
    </FormContainer>
  );
}
