import React, { useEffect, useState } from 'react';

import { maybeCompleteAuthSession } from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
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

import {
  FACEBOOK_APP_ID,
  GOOGLE_ANDROID_ID,
  GOOGLE_IOS_ID,
  GOOGLE_WEB_ID,
  GOOGLE_EXPO_ID
} from '@env';

import transport from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FacebookAuthUser, GoogleAuthUser } from '../types/user';
import { LoginProps } from '../navigation/types';
import { SocialButton, SocialLoginType } from '../components/SocialLogin';
import { FormContainer } from '../components';

maybeCompleteAuthSession();

export default function Login({ navigation }: LoginProps) {
  const { loginWithGoogle, loginWithFacebook } = useAuth();

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    responseType: ResponseType.Token
  });

  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      expoClientId: GOOGLE_EXPO_ID,
      iosClientId: GOOGLE_IOS_ID,
      androidClientId: GOOGLE_ANDROID_ID,
      webClientId: GOOGLE_WEB_ID
    });

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      transport
        .get(`https://graph.facebook.com/me`, {
          params: {
            access_token,
            fields: [
              'id',
              'name',
              'email',
              'picture.height(500)',
              'first_name',
              'last_name'
            ].join(',')
          }
        })
        .then(({ data }) => {
          loginWithFacebook(data as FacebookAuthUser);
        });
    }
    if (googleResponse?.type === 'success') {
      const { access_token } = googleResponse.params;
      transport
        .get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        })
        .then(({ data }) => {
          loginWithGoogle(data as GoogleAuthUser);
        });
    }
  }, [fbResponse, googleResponse]);

  const onAuthFacebook = () => fbPromptAsync();
  const onAuthGoogle = () => googlePromptAsync();

  return (
    <FormContainer>
      <Heading size="lg" fontWeight="600" color="coolGray.800">
        Login
      </Heading>
      <VStack space={3} mt="5">
        <FormControl>
          <FormControl.Label
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Email ID
          </FormControl.Label>
          <Input />
        </FormControl>
        <FormControl>
          <FormControl.Label
            _text={{
              color: 'coolGray.800',
              fontSize: 'xs',
              fontWeight: 500
            }}
          >
            Password
          </FormControl.Label>
          <Input type="password" />
          <Link
            _text={{
              fontSize: 'xs',
              fontWeight: '500',
              color: 'indigo.500'
            }}
            alignSelf="flex-end"
            mt="1"
            href="forgot-password"
          >
            Forget Password?
          </Link>
        </FormControl>
        <Button mt="2" colorScheme="indigo" _text={{ color: 'white' }}>
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
            href="signup"
          >
            Sign Up
          </Link>
        </HStack>
      </VStack>
      <Divider my="2" />
      <VStack>
        <SocialButton
          platformType={SocialLoginType.google}
          disabled={googleRequest === null}
          onPress={onAuthGoogle}
        />
        <SocialButton
          platformType={SocialLoginType.facebook}
          disabled={!fbRequest === null}
          onPress={onAuthFacebook}
        />
      </VStack>
    </FormContainer>
  );
}
