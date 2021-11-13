import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthRoutes } from './types';

import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
import ResetPasswordScreen from '../screens/ResetPassword';
import PasswordChangedScreen from '../screens/PasswordChanged';
import OnboardingScreen from '../screens/Onboarding';

const { Navigator, Screen } = createStackNavigator<AuthRoutes>();

export default function AuthNavigator() {
  return (
    <Navigator headerMode="none">
      <Screen name="Onboarding" component={OnboardingScreen} />
      <Screen name="Login" component={LoginScreen} />
      <Screen name="Signup" component={SignupScreen} />
      <Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Screen name="PasswordChanged" component={PasswordChangedScreen} />
    </Navigator>
  );
}
