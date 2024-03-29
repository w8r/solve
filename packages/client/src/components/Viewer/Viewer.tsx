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
import { Graph, GraphNode, isNode } from '../../types/graph';
import { useVis } from './context';
import { isWeb } from '../../constants/device';

export interface ViewerProps extends ViewProps {
  width?: number;
  height?: number;
  minScale?: number;
  maxScale?: number;
  initialZoom?: number;
  canvasHeight?: number;
  canvasWidth?: number;
  onZoom?: (zoom: number) => void;
  onLongPress?: (node: GraphNode | null) => void;
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

let skipNextTap = false;

export function Viewer({
  width = 1080,
  height = 720,
  minScale = 0.0001,
  maxScale = 1000.0,
  onLongPress = () => {},
  graph
}: ViewerProps) {
  const containerRef = useRef<typeof Canvas>();
  const { app, isSelecting, selectEdge, selectNode, clearSelection } = useVis();
  const dppx = PixelRatio.get();

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
    const { minX, minY, maxX, maxY } = graphBbox(graph);
    const transform = getBoundsTransform(
      minX,
      minY,
      maxX,
      maxY,
      width * dppx,
      height * dppx
    );
    if (graph.nodes.length === 0 || graph.nodes.length === 1) transform.k = 20;
    setState({ ...state, ...transform });
  }, [graph.publicId]);

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
      if (el && isNode(el)) {
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
        const { isMoving, isDragging } = state;

        setState({
          ...state,
          isMoving: false,
          isScaling: false,
          isDragging: null
        });

        if (isSelecting) app.stopSelection();
        if (isDragging) app.setGraph(graph);
        if (isDragging || isMoving) skipNextTap = true;
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
    if (skipNextTap) {
      skipNextTap = false;
      return;
    }
    // on the web this helps suppressing selection after dragging
    const el = isWeb
      ? app.getElementAt(nativeEvent.pageX, nativeEvent.pageY)
      : app.getElementAt(nativeEvent.locationX, nativeEvent.locationY);
    if (el) {
      if (isNode(el)) selectNode(el.id);
      else selectEdge(el._id);
      app.setGraph(graph);
    } else {
      clearSelection();
    }
  };

  const onLongTap = ({ nativeEvent }: GestureResponderEvent) => {
    if (isSelecting) return;
    const el = isWeb
      ? app.getElementAt(nativeEvent.pageX, nativeEvent.pageY)
      : app.getElementAt(nativeEvent.locationX, nativeEvent.locationY);
    if (el) {
      onLongPress(isNode(el) ? el : null);
      // else selectEdge(el._id);
      // app.setGraph(graph);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TouchableWithoutFeedback onPress={onTap} onLongPress={onLongTap}>
        <Canvas
          ref={containerRef}
          style={styles.canvas}
          graph={graph}
          dppx={dppx}
          onWheel={onWheel}
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
