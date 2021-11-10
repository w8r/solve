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
  Divider,
  INumberInputContext
} from 'native-base';
import * as Validator from 'yup';
import { useFormik as useForm } from 'formik';

import { SignupProps } from '../navigation/types';
import { SocialLogin } from '../components/SocialLogin';
import { FormContainer } from '../components';
import * as api from '../services/api';

const LoginSchema = Validator.object().shape({
  name: Validator.string().min(4).max(128),
  password: Validator.string()
    .min(6, 'Too short')
    .max(16, 'Too long')
    .required('Required'),
  passwordRepeat: Validator.string()
    .equals([Validator.ref('password')], "Passwords don't match")
    .required('Required'),
  email: Validator.string().email('Invalid email').required('Required')
});

export default function Signup({ navigation }: SignupProps) {
  const passwordInputRef = useRef<any>(null);
  const passwordRepeatRef = useRef<any>(null);
  const emailRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);

  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useForm({
      validationSchema: LoginSchema,
      initialValues: { name: '', email: '', password: '', passwordRepeat: '' },
      onSubmit: (values) => {
        setIsLoading(true);
        api
          .signup(
            values.name,
            values.email,
            values.password,
            values.passwordRepeat
          )
          // TODO: verify email? or login directly?
          .then(() => setIsLoading(false))
          .catch((err) => {
            if (err && err.error) {
              const {
                error: { code, message }
              } = err;
              // TODO: store globally
              if (code === 'auth/wrong-password') errors.password = message;
              if (code === 'auth/user-not-found') errors.email = message;
            }
            setIsLoading(false);
          });
      }
    });

  const emailError = !!(errors.email && touched.email);
  const passwordError = !!(errors.password && touched.password);
  const passwordRepeatError = !!(
    errors.passwordRepeat && touched.passwordRepeat
  );
  const nameError = !!(errors.name && touched.name);

  return (
    <FormContainer>
      <Heading size="lg" fontWeight="600" color="coolGray.800">
        Sign up
      </Heading>
      <VStack space={3} mt="5">
        <FormControl isInvalid={nameError}>
          <FormControl.Label
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Your name (optional)
          </FormControl.Label>
          <Input
            onChange={(evt) => handleChange('name')(evt.nativeEvent.text)}
            onBlur={handleBlur('name')}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={emailError}>
          <FormControl.Label
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Email
          </FormControl.Label>
          <Input
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
            type="password"
            ref={passwordInputRef}
            onChange={(evt) => handleChange('password')(evt.nativeEvent.text)}
            onBlur={handleBlur('password')}
            onSubmitEditing={() => passwordRepeatRef.current?.focus()}
          />
          <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={passwordRepeatError}>
          <FormControl.Label
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Repeat password
          </FormControl.Label>
          <Input
            type="password"
            ref={passwordRepeatRef}
            onChange={(evt) =>
              handleChange('passwordRepeat')(evt.nativeEvent.text)
            }
            onBlur={handleBlur('passwordRepeat')}
            onSubmitEditing={() => handleSubmit()}
          />
          <FormControl.ErrorMessage>
            {errors.passwordRepeat}
          </FormControl.ErrorMessage>
        </FormControl>
        <Button
          isLoading={isLoading}
          mt="2"
          colorScheme="indigo"
          _text={{ color: 'white' }}
          onPress={() => handleSubmit()}
        >
          Sign up
        </Button>
        <HStack mt="6" justifyContent="center">
          <Text fontSize="sm" color="muted.700" fontWeight={400}>
            I already have an account.{' '}
          </Text>
          <Link
            _text={{
              color: 'indigo.500',
              fontWeight: 'medium',
              fontSize: 'sm'
            }}
            href="login"
          >
            Log in
          </Link>
        </HStack>
      </VStack>
      <Divider my="2" />
      <SocialLogin />
    </FormContainer>
  );
}
