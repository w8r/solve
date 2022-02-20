import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { ViewerProps } from '../../navigation/types';
import Canvas from '../../components/Canvas';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';

const Wrapper = ({ width, height }: { width: number; height: number }) => {
  const { graph, setGraph } = useVis();
  useEffect(() => {
    setGraph({
      nodes: [
        {
          id: 0,
          attributes: { x: 0, y: 0, r: 2, color: 'red' }
        },
        {
          id: 1,
          attributes: { x: 10, y: 10, r: 5, color: 'blue' }
        },
        {
          id: 2,
          attributes: { x: -10, y: 10, r: 3, color: 'green' }
        }
      ],
      edges: [
        {
          id: 3,
          source: 0,
          target: 1,
          attributes: { color: 'darkblue', width: 0.5 }
        },
        {
          id: 4,
          source: 1,
          target: 2,
          attributes: { color: 'darkblue', width: 0.5 }
        },
        {
          id: 5,
          source: 2,
          target: 0,
          attributes: { color: 'darkblue', width: 0.5 }
        }
      ]
    });
  }, []);
  return <Viewer width={width} height={height} graph={graph} />;
};

export default function ({ route }: ViewerProps) {
  const { width, height } = Dimensions.get('window');
  return (
    <VisProvider>
      <Wrapper width={width} height={height} />
    </VisProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
