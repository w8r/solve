import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as UIProvider } from 'react-native-paper';

export default function App() {
  return (
    <UIProvider>
      <View style={styles.container}>
        <Text>Don't open up Ap.tsx to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
    </UIProvider>
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
