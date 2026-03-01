import * as React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme
} from '@react-navigation/native';
import AppLoading from 'expo-app-loading';
import { createStackNavigator } from '@react-navigation/stack';
import { ColorSchemeName } from 'react-native';
import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList } from './types';
import BottomTabNavigator from './BottomTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';

export default function Navigation({
  colorScheme
}: {
  colorScheme?: ColorSchemeName;
}) {
  const { loading } = useAuth();
  // TODO: Load resources
  if (loading) return <AppLoading />;
  return (
    <NavigationContainer linking={LinkingConfiguration} theme={DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

const RootSwitch = createStackNavigator();
function RootSwitchNavigator() {
  const { authenticated, loading } = useAuth();
  if (loading) return <AppLoading />;
  return (
    <RootSwitch.Navigator
      headerMode="none"
      initialRouteName={authenticated ? 'App' : 'Auth'}
    >
      {authenticated ? (
        <RootSwitch.Screen name="App" component={BottomTabNavigator} />
      ) : null}
      {authenticated ? null : (
        <RootSwitch.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootSwitch.Navigator>
  );
}

function RootNavigator() {
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
