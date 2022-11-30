import * as React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme
} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';
import { ColorSchemeName, View, Text } from 'react-native';
import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList } from './types';

import LinkingConfiguration from './LinkingConfiguration';
import { useAuth } from '../hooks/useAuth';
//import BottomTabNavigator from './BottomTabNavigator';
//import AuthNavigator from './AuthNavigator';

//SplashScreen.preventAutoHideAsync();

export function Navigation({ colorScheme }: { colorScheme?: ColorSchemeName }) {
  const { loading } = useAuth();
  const onLayoutRootView = React.useCallback(async () => {
    if (loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);
  // TODO: Load resources
  if (loading) return null;
  return <RootNavigator />;
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <View>
      <Text>App</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <View>
      <Text>Auth</Text>
    </View>
  );
}

const RootSwitch = createStackNavigator();
function RootSwitchNavigator() {
  const { authenticated, loading } = useAuth();
  if (loading) return null;
  return (
    <RootSwitch.Navigator initialRouteName={authenticated ? 'App' : 'Auth'}>
      {authenticated ? (
        <RootSwitch.Screen
          name="App"
          component={AppNavigator}
          options={{ headerMode: 'none' }}
        />
      ) : null}
      {authenticated ? null : (
        <RootSwitch.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootSwitch.Navigator>
  );
}

function RootNavigator() {
  return (
    <Navigator>
      <Screen name="Root" component={RootSwitchNavigator} />
      <Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: 'Oops!' }}
      />
    </Navigator>
  );
}
