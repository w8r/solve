/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Graph, Id } from '../types/graph';

export type BottomTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type TabOneParamList = {
  Dashboard: undefined;
  Viewer: undefined;
  Preview: undefined;
  Graph: undefined;
};
export type TabOneProps = BottomTabScreenProps<BottomTabParamList, 'TabOne'>;

export type TabTwoParamList = {
  Profile: undefined;
  TabTwoScreen: undefined;
};

export type AuthRoutes = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ResetPassword: { token?: string };
  PasswordChanged: undefined;
};

export type OnboardingProps = StackScreenProps<AuthRoutes, 'Onboarding'>;
export type LoginProps = StackScreenProps<AuthRoutes, 'Login'>;
export type SignupProps = StackScreenProps<AuthRoutes, 'Signup'>;
export type ResetPasswordProps = StackScreenProps<AuthRoutes, 'ResetPassword'>;
export type PasswordChangedProps = StackScreenProps<
  AuthRoutes,
  'PasswordChanged'
>;

// @ts-ignore
// const d: SignupProps = {};
// d.navigation.getParent()?.navigate()

export type AppRoutes = {
  Dashboard: undefined;
  Viewer: { graph?: string } | undefined;
  Graph: { graph: Id };
  Preview: { graph: Graph };
  Profile: undefined;
};

export type GraphProps = StackScreenProps<AppRoutes, 'Graph'>;
export type ViewerProps = StackScreenProps<AppRoutes, 'Viewer'>;
export type PreviewProps = StackScreenProps<AppRoutes, 'Preview'>;
export type ProfileProps = StackScreenProps<AppRoutes, 'Profile'>;

export type RootStackParamList = {
  Root: undefined | StackScreenProps<AuthRoutes & AppRoutes>;
  NotFound: undefined;
};

export type NotFoundScreenProps = StackScreenProps<
  RootStackParamList,
  'NotFound'
>;
