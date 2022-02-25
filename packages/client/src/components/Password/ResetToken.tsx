import React, { useRef, useState } from 'react';
import { FormControl, Input, Text, Button, HStack } from 'native-base';
import * as Validator from 'yup';
import { useFormik as useForm } from 'formik';
import * as api from '../../services/api';

const PasswordTokenSchema = Validator.object().shape({
  email: Validator.string().email('Invalid email').required('Required')
});

export function ResetPasswordToken() {
  const submitRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { handleChange, handleBlur, submitForm, values, errors, touched } =
    useForm({
      validationSchema: PasswordTokenSchema,
      initialValues: { email: '' },
      onSubmit: (values) => {
        setLoading(true);
        api
          .resetPasswordRequest(values.email)
          .then(({ success }) => {
            if (success) setSuccess(true);
            setLoading(false);
          })
          .catch((err) => {
            if (err && err.error) {
              const {
                error: { code, message }
              } = err;
              if (code === 'auth/user-not-found') errors.email = message;
            }
            setLoading(false);
          });
      }
    });

  const emailError = !!(errors.email && touched.email);
  if (success)
    return (
      <HStack>
        <Text>Success!</Text>
      </HStack>
    );

  return (
    <>
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
        onPress={() => submitForm()}
      >
        Reset password
      </Button>
    </>
  );
}
