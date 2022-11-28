import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as UIProvider } from 'react-native-paper';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import { NavigationContainer } from '@react-navigation/native';
import { theme } from './theme';
import { AuthProvider } from './src/contexts/AuthContext';

const HelloWorld = () => {
  const size = 256;
  const r = size * 0.33;
  return (
    <Canvas style={{ flex: 1, width: '100%', height: 100 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={size - r} cy={r} r={r} color="magenta" />
        <Circle cx={size / 3} cy={size - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <UIProvider theme={theme}>
        <AuthProvider>
          <View style={styles.container}>
            <HelloWorld />
            <StatusBar style="auto" />
          </View>
        </AuthProvider>
      </UIProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
