import { isWeb } from './device';
import { tunnel } from './env.json';
import { SERVER_PUBLIC_URL, API_URL } from '@env';
console.log(SERVER_PUBLIC_URL, API_URL, tunnel);

// @ts-ignore
const devMode = process.env.NODE_ENV !== 'development';

export default {
  // App Details
  appName: 'Solve',

  // Build Configuration - eg. Debug or Release?
  DEV: devMode,

  // Google Analytics - uses a 'dev' account while we're testing
  gaTrackingId: devMode ? 'UA-84284256-2' : 'UA-84284256-1',

  apiUrl: tunnel || SERVER_PUBLIC_URL //'http://645a-77-141-193-89.ngrok.io'
};
