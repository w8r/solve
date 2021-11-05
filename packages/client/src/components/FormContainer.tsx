import React, { FC } from 'react';
import { Platform } from 'react-native';
import { KeyboardAvoidingView, ScrollView, Box, Center } from 'native-base';

export const FormContainer: FC = ({ children }) => {
  return (
    <ScrollView
      minW="72"
      paddingY="20"
      paddingX="10"
      _contentContainerStyle={{
        justifyItems: 'center'
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Center>
          <Box safeArea w={{ base: '100%', lg: 'md' }}>
            {children}
          </Box>
        </Center>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};
