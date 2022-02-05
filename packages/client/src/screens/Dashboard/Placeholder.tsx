import React from 'react';
import { Box, Center, FlatList, ScrollView } from 'native-base';

export default function Placeholder() {
  return (
    <ScrollView>
      <Box padding="10" flex={1} p="5">
        <Center>
          <FlatList
            numColumns={5}
            data={Array(10)
              .fill(0)
              .map(() => ({}))}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ index }) => (
              <Box
                bg="blueGray.200"
                p="2"
                rounded="sm"
                height="40"
                minWidth="40"
                marginRight="10"
                marginBottom="10"
              />
            )}
          />
        </Center>
      </Box>
    </ScrollView>
  );
}
