import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spinner } from 'native-base';

export const Loading: FC = () => {
  return (
    <View style={styles.container}>
      <Spinner size="lg" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', //Centered horizontally
    alignItems: 'center', //Centered vertically
    flex: 1
  }
});
