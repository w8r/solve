import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeBaseProvider } from 'native-base';
import { AuthProvider } from './src/contexts/AuthContext';

import useCachedResources from './src/hooks/useCachedResources';
import useColorScheme from './src/hooks/useColorScheme';
import Navigation from './src/navigation';
import SSRProvider from 'react-bootstrap/SSRProvider';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SSRProvider>
        <NativeBaseProvider>
          <SafeAreaProvider>
            <AuthProvider>
              <Navigation />
              <StatusBar />
            </AuthProvider>
          </SafeAreaProvider>
        </NativeBaseProvider>
      </SSRProvider>
    );
  }
}
