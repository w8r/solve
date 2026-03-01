import React from 'react';
//import Graph from './Graph';
import { View, StyleSheet, Text } from 'react-native';

export default function Canvas() {
  return (
    <View style={styles.container}>
      <Text>web canvas</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: {} });

// export default function Canvas({ width, height, graph }) {
//   return <Graph graph={graph} width={width} height={height} />;
// }
