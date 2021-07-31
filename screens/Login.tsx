import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
//import * as Facebook from 'expo-facebook';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

import { maybeCompleteAuthSession } from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
import { Button } from 'native-base';

import {
  FACEBOOK_APP_ID,
  GOOGLE_ANDROID_ID,
  GOOGLE_IOS_ID,
  GOOGLE_WEB_ID,
  GOOGLE_EXPO_ID
} from '@env';
import axios from 'axios';

maybeCompleteAuthSession();

//TODO: https://docs.expo.io/guides/authentication/#facebook

export default function Login() {
  const [jsonObject, setJsonObject] = React.useState({});
  //   try {
  //     await Facebook.initializeAsync({ appId: FACEBOOK_APP_ID });
  //     const loginResult = await Facebook.logInWithReadPermissionsAsync({
  //       permissions: ['public_profile', 'email']
  //     });
  //     if (loginResult.type === 'success') {
  //       console.log(loginResult);
  //       const response = await fetch(
  //         `https://graph.facebook.com/me?access_token=${loginResult.token}`
  //       );
  //       const json_rep = await response.json();
  //       setJsonObject(json_rep);
  //       alert(`Hi ${json_rep.name}, your id is ${json_rep.id}!`);
  //     } else {
  //       alert(`Cancel`);
  //     }
  //   } catch ({ message }) {
  //     alert(`Facebook Login Error: ${message}`);
  //   }
  // };

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

  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      fetch(
        `https://graph.facebook.com/me?access_token=${access_token}&fields=id,name,email,picture.height(500)`
      )
        .then((d) => d.json())
        .then((json) => setJsonObject(json));
    }
    if (googleResponse?.type === 'success') {
      const { access_token } = googleResponse.params;
      axios
        .get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        })
        .then((json) => setJsonObject(json));
    }
  }, [fbResponse, googleResponse]);

  const onAuthFacebook = () => fbPromptAsync();
  const onAuthGoogle = () => googlePromptAsync();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button
        disabled={!fbRequest}
        onPress={onAuthFacebook}
        style={[styles.button, { backgroundColor: '#3b5998' }]}
      >
        {/* <FontAwesome name="facebook" size={17} color="#ffffff" /> */}
        Sign in with Facebook
      </Button>
      <Button
        disabled={!googleRequest}
        onPress={onAuthGoogle}
        style={[styles.button, { backgroundColor: '#ff3b59' }]}
      >
        {/* <FontAwesome name="google" size={17} color="#ffffff" /> */}
        Sign in with Google
      </Button>
      <View>
        <Text>{JSON.stringify(jsonObject, undefined, 2)}</Text>
      </View>
      <EditScreenInfo path="/screens/Login.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  button: {
    marginTop: 20
  },
  text: {},
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
