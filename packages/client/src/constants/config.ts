import { SERVER_PUBLIC_URL } from '@env';

// @ts-ignore
const devMode = process.env.NODE_ENV !== 'development';

console.log('api url', SERVER_PUBLIC_URL);

export default {
  // App Details
  appName: 'Solve',

  // Build Configuration - eg. Debug or Release?
  DEV: devMode,

  // Google Analytics - uses a 'dev' account while we're testing
  gaTrackingId: devMode ? 'UA-84284256-2' : 'UA-84284256-1',

  apiUrl: SERVER_PUBLIC_URL
};
