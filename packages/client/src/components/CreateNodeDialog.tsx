import { BottomSheet } from 'react-native-btr';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Button } from 'react-native';


export default function CreateNodeDialog({visibility}: {visibility: boolean}) {
    const [isVisible, setVisibility] = useState(visibility);
    return (
        <SafeAreaView style={styles.container}>
        <BottomSheet
            visible={isVisible}
            onBackButtonPress={() => setVisibility(false)}
            onBackdropPress={() => setVisibility(false)}
        >
           <View style={styles.bottomNavigationView}>
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  padding: 20,
                  fontSize: 20,
                }}>
                Share Using
              </Text>
              </View>
            </View>
        </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  bottomNavigationView: {
    backgroundColor: '#fff',
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
});