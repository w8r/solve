import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';

import App from './App';

if ('web' === Platform.OS) {
  const rootTag = createRoot(
    document.getElementById('root') ?? document.getElementById('main')
  );
  rootTag.render(createElement(App));
} else {
  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(App);
}
