import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  ViewProps,
  PanResponderGestureState,
  PixelRatio,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  GestureResponderEvent
} from 'react-native';
import { Canvas } from './Canvas';
import {
  distance as calcDistance,
  center as calcCenter,
  clamp,
  bbox as graphBbox,
  getBoundsTransform,
  zoomAround
} from './utils';
import { usePanResponder } from './usePanResponder';
import type { Graph, GraphNode } from '../../types/graph';
import { useVis } from './context';

export interface ViewerProps extends ViewProps {
  width?: number;
  height?: number;
  minScale?: number;
  maxScale?: number;
  initialZoom?: number;
  canvasHeight?: number;
  canvasWidth?: number;
  onZoom?: (zoom: number) => void;
  graph: Graph;
}

interface ViewerState {
  isMoving: boolean;
  isScaling: boolean;
  isDragging: null | GraphNode;
  initialDistance: number;

  x: number;
  y: number;
  k: number;

  initialZoom: number;
  initialLeft: number;
  initialTop: number;
  initialX: number;
  initialY: number;
  dragOffsetX: number;
  dragOffsetY: number;
}

export function Viewer({
  width = 1080,
  height = 720,
  minScale = 0.0001,
  maxScale = 1000.0,
  graph
}: ViewerProps) {
  const containerRef = useRef<typeof Canvas>();
  const { app, isSelecting } = useVis();
  const dppx = PixelRatio.get();

  const { minX, minY, maxX, maxY } = graphBbox(graph);

  const [state, setState] = useState<ViewerState>({
    // gesture state
    isMoving: false,
    isScaling: false,
    isDragging: null,

    // transform
    x: 0,
    y: 0,
    k: 1,

    // intermediate state
    initialZoom: 0,
    initialLeft: 0,
    initialTop: 0,
    initialX: 0,
    initialY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    initialDistance: 1
  });

  useEffect(() => {
    const transform = getBoundsTransform(
      minX,
      minY,
      maxX,
      maxY,
      width * dppx,
      height * dppx,
      20
    );
    setState({ ...state, ...transform });
  }, [graph]);

  const processPinch = (x1: number, y1: number, x2: number, y2: number) => {
    const distance = calcDistance(x1, y1, x2, y2);
    const { x, y } = calcCenter(x1, y1, x2, y2);
    const { isScaling } = state;

    if (!isScaling) {
      setState({
        ...state,
        isScaling: true,
        initialX: x - width / 2,
        initialY: y - height / 2,
        initialTop: state.y,
        initialLeft: state.x,
        initialZoom: state.k,
        initialDistance: distance
      });
    } else {
      const delta = distance / state.initialDistance;
      const dx = x - state.initialX;
      const dy = y - state.initialY;

      const x1 = (state.initialLeft + dx - x) * delta + x - width / 2;
      const y1 = (state.initialTop + dy - y) * delta + y - height / 2;
      const k = clamp(state.initialZoom * delta, minScale, maxScale);

      setState({ ...state, k, x: x1, y: y1 });
    }
  };

  const processTouch = ({
    dx,
    dy,
    x0,
    y0,
    moveX,
    moveY
  }: PanResponderGestureState) => {
    if (!app) return;
    // if drawing a lasso, don't move the graph, update the lasso polygon
    if (isSelecting) {
      app.updateLasso(moveX, moveY);
    } else if (state.isDragging) {
      const { isDragging, dragOffsetX, dragOffsetY } = state;
      const { x, y } = app.screenToWorld(moveX, moveY);
      app.moveNode(isDragging, x - dragOffsetX, y - dragOffsetY);
    } else if (!state.isMoving) {
      // figure out if we are on the node or not
      const el = app.getElementAt(moveX, moveY);
      if (el) {
        const pos = app.screenToWorld(moveX, moveY);
        const dragOffsetX = pos.x - el.attributes.x;
        const dragOffsetY = pos.y - el.attributes.y;

        return setState({ ...state, isDragging: el, dragOffsetX, dragOffsetY });
      }

      setState({
        ...state,
        isMoving: true,
        initialLeft: state.x,
        initialTop: state.y,
        initialX: x0,
        initialY: y0
      });
    } else if (state.isMoving) {
      setState({
        ...state,

        x: state.x + dx,
        y: state.y + dy
      });
    }
  };

  const panResponder = usePanResponder(
    {
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

      onPanResponderGrant: (evt, gestureState) => {},
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const [t0, t1] = touches;
          processPinch(t0.pageX, t0.pageY, t1.pageX, t1.pageY);
        } else if (touches.length === 1 && !state.isScaling) {
          processTouch(gestureState);
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        if (isSelecting) app.stopSelection();
        if (state.isMoving) app.setGraph(graph);
        setState({
          ...state,
          isMoving: false,
          isScaling: false,
          isDragging: null
        });
      },
      onPanResponderTerminate: (evt, gestureState) => {},
      onShouldBlockNativeResponder: (evt, gestureState) => true
    },
    [state, app]
  );

  const onWheel = (evt: WheelEvent) => {
    const { deltaY } = evt;
    const newZoom = clamp(state.k - deltaY / 100, minScale, maxScale);

    setState({
      ...state,
      ...zoomAround(
        { x: state.x, y: state.y, k: state.k },
        evt.pageX - width / 2,
        evt.pageY - height / 2,
        newZoom
      )
    });
  };

  const onTap = ({ nativeEvent }: GestureResponderEvent) => {
    const el = app.getElementAt(nativeEvent.locationX, nativeEvent.locationY);
    if (el) {
      graph.nodes.forEach((n) => {
        if (n.id === el.id) {
          n.attributes.color = 'cyan';
        }
      });
      app.setGraph(graph);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TouchableWithoutFeedback onPress={onTap}>
        <Canvas
          ref={containerRef}
          style={styles.canvas}
          onWheel={onWheel}
          graph={graph}
          dppx={dppx}
          transform={{ x: state.x, y: state.y, k: state.k }}
        />
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  canvas: {
    flex: 1
  }
});
