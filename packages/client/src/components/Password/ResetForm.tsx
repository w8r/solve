import React, { useRef, useState } from 'react';
import { FormControl, Input, Text, Button, HStack } from 'native-base';
import * as Validator from 'yup';
import { useFormik as useForm } from 'formik';
import * as api from '../../services/api';

const validationSchema = Validator.object().shape({
  name: Validator.string().min(4).max(128),
  password: Validator.string()
    .min(6, 'Too short')
    .max(16, 'Too long')
    .required('Password is required'),
  passwordRepeat: Validator.string()
    .equals([Validator.ref('password')], "Passwords don't match")
    .required('Required')
});

export function ResetPasswordForm({
  token,
  onSuccess
}: {
  token: string;
  onSuccess: () => void;
}) {
  const submitRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useForm({
      validationSchema,
      initialValues: { password: '', passwordRepeat: '' },
      onSubmit: (values) => {
        setLoading(true);
        api
          .resetPassword(token, values.password, values.passwordRepeat)
          .then(({ success }) => {
            setLoading(false);
            if (success) onSuccess();
          })
          .catch((err) => {
            if (err && err.error) {
              const {
                error: { code, message }
              } = err;
              if (code === 'auth/user-not-found') errors.password = message;
            }
            setLoading(false);
          });
      }
    });

  const passwordError = !!(errors.password && touched.password);
  const passwordRepeatError = !!(
    errors.passwordRepeat && touched.passwordRepeat
  );
  const passwordRepeatRef = useRef<any>(null);

  return (
    <>
      <FormControl isInvalid={passwordError}>
        <FormControl.Label
          _text={{
            color: 'coolGray.800',
            fontSize: 'xs',
            fontWeight: 500
          }}
        >
          New password
        </FormControl.Label>
        <Input
          type="password"
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
        isLoading={loading}
        ref={submitRef}
        mt="2"
        colorScheme="indigo"
        _text={{ color: 'white' }}
        onPress={() => handleSubmit()}
      >
        Reset password
      </Button>
    </>
  );
}
