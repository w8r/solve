import * as React from 'react';
import { StyleSheet, Linking, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { StackNavigationProps } from '../navigation/AppRoutes';
import { RootStackParamList } from '../navigation/types';

export default function TabOneScreen({
  navigation
}: StackNavigationProps<RootStackParamList, 'Root'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Root', {
            screen: 'Auth',
            params: { screen: 'Login' }
          })
        }
      >
        <Text>Login</Text>
      </TouchableOpacity>
      <EditScreenInfo path="/screens/TabOneScreen.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
