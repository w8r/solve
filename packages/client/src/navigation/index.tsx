/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';

import Login from '../screens/Login';
import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList } from './types';
import BottomTabNavigator from './BottomTabNavigator';
import { Spinner } from 'native-base';
//import AuthNavigator from './AuthNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import { useAuth } from '../hooks/useAuth';

export default function Navigation({
  colorScheme
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { authenticated, loading } = useAuth();
  console.log({ authenticated, loading });
  if (loading) return <Spinner size="large" />;
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      {authenticated ? (
        <Screen name="Root" component={BottomTabNavigator} />
      ) : (
        <Screen name="Login" component={Login} />
      )}
      <Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: 'Oops!' }}
      />
    </Navigator>
  );
}
