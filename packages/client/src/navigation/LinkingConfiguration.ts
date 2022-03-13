/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import * as Linking from 'expo-linking';
import { Graph } from '../types/graph';

export default {
  prefixes: ['solve://', Linking.makeUrl('/')],
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
                    path: 'viewer/:graph?/:mode?',
                    parse: {
                      graph: (graph: string) => `${graph}`
                    }
                  },
                  Preview: {
                    path: 'preview/:graph',
                    parse: {
                      graph: (uri: string) =>
                        JSON.parse(decodeURIComponent(uri))
                    },
                    stringify: {
                      graph: (graph: Graph) => JSON.stringify(graph)
                    }
                  },
                  Graph: 'graph/:graph',
                  Proposal: 'proposal/:graph'
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
