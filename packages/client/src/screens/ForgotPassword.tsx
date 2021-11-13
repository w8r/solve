import React, { useRef, useState } from 'react';
import { FormControl, Heading, Input, VStack, Button } from 'native-base';
import { FormContainer } from '../components';
import * as Validator from 'yup';
import { useFormik as useForm } from 'formik';

const PasswordRecoverySchema = Validator.object().shape({
  email: Validator.string().email('Invalid email').required('Required')
});

export default function ForgotPassword() {
  const submitRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useForm({
      validationSchema: PasswordRecoverySchema,
      initialValues: { email: '' },
      onSubmit: (values) => {
        setLoading(true);
        Promise.resolve()
          .then(() => setLoading(false))
          .catch((err) => {
            if (err && err.error) {
              const {
                error: { code, message }
              } = err;
              // TODO: store globally
              if (code === 'auth/user-not-found') errors.email = message;
            }
            setLoading(false);
          });
      }
    });

  const emailError = !!(errors.email && touched.email);

  return (
    <FormContainer>
      <Heading>Forgot password</Heading>
      <VStack space={3} mt="5">
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
            onSubmitEditing={() => submitRef.current?.press()}
          />
          <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
        </FormControl>
        <Button
          isLoading={loading}
          ref={submitRef}
          mt="2"
          colorScheme="indigo"
          _text={{ color: 'white' }}
          onPress={() => handleSubmit()}
        >
          Reset password
        </Button>
      </VStack>
    </FormContainer>
  );
}
