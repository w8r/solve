import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'native-base';

export function Logo() {
  return (
    <Image
      source={require('../../assets/images/logo.png')}
      style={styles.image}
      alt="logo"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 128,
    height: 128,
    marginBottom: 12
  }
});
