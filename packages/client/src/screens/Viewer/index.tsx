import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ViewerProps } from '../../navigation/types';

export default function Viewer({ route }: ViewerProps) {
  console.log(route);
  return (
    <View>
      <Text>Viewer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
