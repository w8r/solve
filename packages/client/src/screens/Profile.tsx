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
  ScrollView
} from 'native-base';
import { useAuth } from '../hooks/useAuth';
import { getShortName } from '../lib/user';

export default function Profile() {
  const { user, logout } = useAuth();
  console.log(user);
  return (
    <ScrollView>
      <Center>
        <Box>
          <Box style={styles.avatarContainer}>
            <Avatar size={32} bg="blueGray.700" style={styles.avatar}>
              {getShortName(user)}
            </Avatar>
          </Box>
          <Divider />
          <Heading>{user.name}</Heading>
          <Box style={styles.scoreContainer}>
            <Badge size={88} style={styles.scoreBadge}>
              {user.score}
            </Badge>
          </Box>
          {/* <Paragraph>{JSON.stringify(user)}</Paragraph> */}
          <Button onPress={() => logout()}>Logout</Button>
        </Box>
      </Center>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scoreContainer: {
    flex: 1,
    marginTop: 60,
    marginBottom: 30,
    alignContent: 'flex-end'
  },
  avatarContainer: {},
  scoreBadge: {
    backgroundColor: '#cccccc'
  },
  avatar: {
    marginTop: 80
  }
});
