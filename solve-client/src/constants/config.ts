import { isWeb } from './device';

// @ts-ignore
const devMode = process.env.NODE_ENV !== 'development';

export default {
  // App Details
  appName: 'Solve',

  // Build Configuration - eg. Debug or Release?
  DEV: devMode,

  // Google Analytics - uses a 'dev' account while we're testing
  gaTrackingId: devMode ? 'UA-84284256-2' : 'UA-84284256-1',

  apiUrl: isWeb ? '' : 'http://286ddc3545b0.ngrok.io' //'http://192.168.0.13:3001'
};
