import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, Group, Circle } from '@shopify/react-native-skia';

export const CircleThree = () => {
  const size = 256;
  const r = size * 0.33;
  return (
    <Canvas style={{ flex: 1, borderColor: 'red', width: 200, height: 300 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={size - r} cy={r} r={r} color="magenta" />
        <Circle cx={size / 2} cy={size - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      {/* <Text>Open up App.tsx to start working on your app!</Text> */}
      <CircleThree />
      <StatusBar style="auto" />
    </View>
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
