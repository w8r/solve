import React, { FC } from 'react';
import {
  Modal,
  VStack,
  Center,
  Icon,
  Box,
  Text,
  Link,
  Image
} from 'native-base';
import { Feather as Icons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Graph } from '../../types/graph';
import { getGraphPreviewURL } from '../../services/api';
import { successColor } from '../../constants/Colors';

export const SuccessModal: FC<{ graph: Graph }> = ({ graph }) => {
  const { navigate } = useNavigation();
  return (
    <Modal isOpen={true}>
      <Modal.Content>
        <Modal.Body>
          <Center>
            <VStack>
              <Box>
                <Icon as={Icons} name="check" color={successColor} size="lg" />
              </Box>
              <Box>
                <Image
                  alt={graph.publicId as string}
                  source={{
                    uri:
                      getGraphPreviewURL(graph.publicId as string) +
                      `?${Date.now()}`
                  }}
                  width="40"
                  height="40"
                />
              </Box>
              <Box>
                <Text>Saved!</Text>
                <Link
                  _text={{
                    color: 'indigo.500'
                  }}
                  mt="1"
                  onPress={() => navigate('Dashboard')}
                >
                  Go to dashboard
                </Link>
              </Box>
            </VStack>
          </Center>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};
