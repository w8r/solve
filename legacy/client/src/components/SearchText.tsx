import React from 'react';
import { StyleSheet } from 'react-native';
import { Feather as Icons } from '@expo/vector-icons';

import { View, Text, Input, Icon } from 'native-base';
interface SearchProps {
  onChangeText: (text: string) => void;
}

export function SearchText({ onChangeText }: SearchProps) {
  return (
    <View style={styles.searchSection}>
      <Icons style={styles.searchIcon} name="search" size={20} color="#000" />
      <Input
        style={styles.input}
        onChangeText={onChangeText}
        placeholder="Type here to search"
      />
    </View>
  );
}

// styles for a small search bar on top of dashboard
const styles = StyleSheet.create({
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderRadius: 5,
    right: 15,
    marginHorizontal: 25,
    marginVertical: 5,
    paddingHorizontal: 25,
    paddingVertical: 5
  },
  searchIcon: {
    padding: 5
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    width: 50,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242'
  }
});
