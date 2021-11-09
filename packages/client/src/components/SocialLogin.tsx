import React, { ReactNode, useEffect } from 'react';
import { Path, G } from 'react-native-svg';
import { FontAwesome as Icons } from '@expo/vector-icons';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';

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

import {
  Button,
  Box,
  useTheme,
  Text,
  Icon,
  IButtonProps,
  VStack
} from 'native-base';

export enum SocialLoginType {
  facebook = 'facebook',
  google = 'google'
}

export const GoogleIcon = () => (
  <Icon width="24" height="24" viewBox="0 0 24 24">
    <G fill="none">
      <Path
        d="M6 12C6 15.3137 8.68629 18 12 18C14.6124 18 16.8349 16.3304 17.6586 14H12V10H21.8047V14H21.8C20.8734 18.5645 16.8379 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.445 2 18.4831 3.742 20.2815 6.39318L17.0039 8.68815C15.9296 7.06812 14.0895 6 12 6C8.68629 6 6 8.68629 6 12Z"
        fill="currentColor"
      />
    </G>
  </Icon>
);

export const FacebookIcon = () => (
  <Icon width="24" height="24" viewBox="0 0 24 24">
    <G fill="none">
      <Path
        d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"
        fill="currentColor"
      />
    </G>
  </Icon>
);

const buttonProps = {
  [SocialLoginType.facebook]: {
    icon: 'facebook',
    text: 'Facebook',
    color: '#3b5998'
  },
  [SocialLoginType.google]: {
    icon: 'google',
    text: 'Google',
    color: '#EA4335'
  }
};

export const SocialButton = ({
  platformType,
  ...props
}: {
  platformType: SocialLoginType;
} & IButtonProps) => {
  const { color, icon, text } = buttonProps[platformType];
  return (
    <Button
      marginBottom="1.5"
      backgroundColor={color}
      leftIcon={<Icon as={Icons} name={icon} size="sm" />}
      {...props}
    >
      <Text fontWeight="bold" color="white">
        Sign in with {text}
      </Text>
    </Button>
  );
};

interface SocilaIconProps {
  children: ReactNode;
}

export const SocialIcon = ({ children }: SocilaIconProps) => {
  const theme = useTheme();
  return (
    <Box
      borderRadius="l"
      margin="s"
      width={theme.sizes.icon}
      height={theme.sizes.icon}
      justifyContent="center"
      alignItems="center"
      backgroundColor="white"
    >
      {children}
    </Box>
  );
};

maybeCompleteAuthSession();

export function SocialLogin() {
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
  );
}
