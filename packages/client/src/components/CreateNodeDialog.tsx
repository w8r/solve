import { BottomSheet } from 'react-native-btr';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Button } from 'react-native';
import { Modal } from 'native-base';

export default function CreateNodeDialog({
  visibility,
  setVisibility
}: {
  visibility: boolean;
  setVisibility: (visibility: boolean) => void;
}) {
  return (
    <Modal
      isOpen={visibility}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      isKeyboardDismissable={true}
      animationPreset="slide"
      avoidKeyboard={true}
      closeOnOverlayClick={true}
    >
      <View style={styles.bottomNavigationView}>
        <Text style={styles.closeButton} onPress={() => setVisibility(false)}>
          Close
        </Text>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              padding: 20,
              fontSize: 20
            }}
          >
            Add a new node
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: '#fff',
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // top right corner css
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#fff'
  }
});
