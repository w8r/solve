import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Avatar,
  Box,
  Center,
  Heading,
  Divider,
  Button,
  Badge,
  ScrollView,
  VStack
} from 'native-base';
import { useAuth } from '../hooks/useAuth';
import { getShortName } from '../lib/user';
import { ProfileProps } from '../navigation/types';
import { BackButton } from '../components/BackButton';
import { useNavigation } from '@react-navigation/native';

export default function Profile({ navigation }: ProfileProps) {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  if (!user) return null;
  return (
    <>
      <BackButton />
      <ScrollView>
        <Center style={styles.container}>
          <Box>
            <Box style={styles.avatarContainer}>
              <Avatar size={32} bg="blueGray.700" style={styles.avatar}>
                {getShortName(user)}
              </Avatar>
            </Box>
            <Divider />
            <Heading>{user.name}</Heading>
            {/* <Box style={styles.scoreContainer}>
              <Badge size={88} style={styles.scoreBadge}>
                {user.score}
              </Badge>
            </Box> */}
            {/* <Paragraph>{JSON.stringify(user)}</Paragraph> */}
            <VStack space="5" style={styles.controls}>
              <Button onPress={() => navigate('App', { screen: 'TabOne' })}>
                Dashboard
              </Button>
              <Button onPress={() => logout()}>Logout</Button>
            </VStack>
          </Box>
        </Center>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 100
  },
  scoreContainer: {
    flex: 1,
    marginTop: 80,
    marginBottom: 30,
    alignContent: 'flex-end'
  },
  avatarContainer: {
    marginTop: 80,
    alignItems: 'center',
    marginBottom: 20
  },
  scoreBadge: {
    backgroundColor: '#cccccc'
  },
  controls: {
    marginTop: 40
  },
  avatar: {
    marginTop: 100
  }
});
