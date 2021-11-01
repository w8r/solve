/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export type BottomTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type TabOneParamList = {
  TabOneScreen: undefined;
};

export type TabTwoParamList = {
  TabTwoScreen: undefined;
};

export type AuthRoutes = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  PasswordChanged: undefined;
};

export type OnboardingProps = StackScreenProps<AuthRoutes, 'Onboarding'>;

export type AppRoutes = {
  Dashboard: undefined;
  Profile: undefined;
  Viewer: undefined;
};

export type RootStackParamList = {
  Root: undefined | StackScreenProps<AuthRoutes & AppRoutes>;
  NotFound: undefined;
};

export type NotFoundScreenProps = StackScreenProps<
  RootStackParamList,
  'NotFound'
>;
