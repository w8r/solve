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
            path: '/',
            screens: {
              TabOne: {
                screens: {
                  Dashboard: 'dashboard',
                  Viewer: {
                    path: 'viewer/:graph',
                    parse: {
                      graph: (graph: string) => `${graph}`
                    }
                  },
                  Preview: 'preview',
                  Graph: 'graph/:graph'
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
            path: 'auth',
            initialRouteName: 'Onboarding',
            screens: {
              Login: 'login',
              Signup: 'signup',
              ResetPassword: {
                path: 'reset-password/:token?',
                parse: {
                  token: (token: string) => `${token}`
                }
              },
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
