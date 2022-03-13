import * as React from 'react';
import { useState, forwardRef, useEffect } from 'react';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { StyleSheet, ViewProps } from 'react-native';
import { App } from './App';
import { Transform } from './utils';
import { Graph } from '../../types/graph';
import { useVis } from './context';
import { useIsFocused } from '@react-navigation/native';

type CanvasProps = ViewProps & {
  onWheel?: (e: WheelEvent) => void;
  transform?: Transform;
  graph?: Graph;
  dppx?: number;
};

export const Canvas = forwardRef(
  (
    { transform = { x: 0, y: 0, k: 1 }, graph, dppx = 1, ...rest }: CanvasProps,
    ref
  ) => {
    //const [app, setApp] = useState<App | null>(null);
    const [gl, setGl] = useState<ExpoWebGLRenderingContext | null>(null);
    const { app, setApp } = useVis();
    const isFocused = useIsFocused();

    app?.setView(transform.x, transform.y, transform.k);

    // @ts-ignore
    useEffect(() => {
      if (graph && app) {
        app?.setGraph(graph);
        app?.setView(transform.x, transform.y, transform.k);
      }
      app?.frame();
    }, [graph, app, isFocused]);

    useEffect(() => {
      return () => {
        app?.destroy();
      };
    }, [gl]);

    const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
      setApp(new App(gl, dppx));
      setGl(gl);
    };

    return (
      <GLView
        style={styles.container}
        onContextCreate={onContextCreate}
        {...rest}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  }
});
