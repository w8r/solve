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
import AuthNavigator from './AuthNavigator';

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

function RootSwitchNavigator() {
  const { Navigator, Screen } = createStackNavigator();
  const { authenticated } = useAuth();

  console.log('authenticated', authenticated);

  return (
    <Navigator headerMode="none">
      {authenticated ? (
        <Screen name="App" component={BottomTabNavigator} />
      ) : (
        <Screen name="Auth" component={AuthNavigator} />
      )}
    </Navigator>
  );
}

function RootNavigator() {
  const { loading } = useAuth();
  if (loading) return <Spinner size="large" />;
  return (
    <Navigator headerMode="none">
      <Screen name="Root" component={RootSwitchNavigator} />
      <Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: 'Oops!' }}
      />
    </Navigator>
  );
}
