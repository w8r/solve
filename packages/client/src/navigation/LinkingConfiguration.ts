/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          App: {
            screens: {
              TabOne: {
                screens: {
                  Dashboard: 'dashboard',
                  Viewer: 'viewer/:graph?'
                }
              },
              TabTwo: {
                screens: {
                  Profile: 'profile',
                  TabTwoScreen: 'two'
                }
              }
            }
          },
          Auth: {
            screens: {
              Login: 'login',
              Signup: 'signup',
              ResetPassword: 'reset-password/:token?',
              Onboarding: 'onboarding',
              PasswordChanged: 'password-changed'
            }
          }
        }
      },
      NotFound: '*'
    }
  }
};
