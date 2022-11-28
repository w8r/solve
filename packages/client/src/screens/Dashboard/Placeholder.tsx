import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Box, Center, HStack } from 'native-base';

export default function Placeholder() {
  return (
    <Center>
      <Box padding="5" flex={1} paddingTop={35}>
        <HStack>
          <Box bg="blueGray.200" rounded="sm" style={styles.box} />
          <Box bg="blueGray.200" rounded="sm" style={styles.box} />
        </HStack>
        <HStack>
          <Box bg="blueGray.200" rounded="sm" style={styles.box} />
          <Box bg="blueGray.200" rounded="sm" style={styles.box} />
        </HStack>
      </Box>
    </Center>
  );
}

const styles = StyleSheet.create({
  container: {},
  box: {
    height: 160,
    minWidth: 160,
    marginRight: 20,
    marginBottom: 20
  }
});
