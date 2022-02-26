import React, { useRef, FC, ReactNode, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponder,
  View
} from 'react-native';

const HorizontalLine: FC<{}> = () => (
  <View
    style={{
      marginTop: 10,
      marginBottom: 10,
      height: 3,
      width: '40%',
      position: 'relative',
      left: '50%',
      marginStart: '-20%',
      backgroundColor: '#d3d3d3'
    }}
  />
);

const { height } = Dimensions.get('window');

export enum DrawerState {
  Open = height - 230,
  Peek = 230,
  Closed = 0
}

const animateMove = (
  y: Animated.Value,
  toValue: number | Animated.Value,
  callback?: any
) => {
  Animated.spring(y, {
    toValue: -toValue,
    tension: 20,
    useNativeDriver: true
  }).start((finished) => {
    /* Optional: But the purpose is to call this after the the animation has finished. Eg. Fire an event that will be listened to by the parent component */
    finished && callback && callback();
  });
};

const getNextState = (
  currentState: DrawerState,
  val: number,
  margin: number
): DrawerState => {
  switch (currentState) {
    case DrawerState.Peek:
      return val >= currentState + margin
        ? DrawerState.Open
        : val <= DrawerState.Peek - margin
        ? DrawerState.Closed
        : DrawerState.Peek;
    case DrawerState.Open:
      return val >= currentState
        ? DrawerState.Open
        : val <= DrawerState.Peek
        ? DrawerState.Closed
        : DrawerState.Peek;
    case DrawerState.Closed:
      return val >= currentState + margin
        ? val <= DrawerState.Peek + margin
          ? DrawerState.Peek
          : DrawerState.Open
        : DrawerState.Closed;
    default:
      return currentState;
  }
};

interface BottomDrawerProps {
  children?: ReactNode;
  onDrawerStateChange?: (nextState: DrawerState) => void;
  initialState?: DrawerState;
}

export const BottomDrawer: FC<BottomDrawerProps> = ({
  children,
  onDrawerStateChange = () => {},
  initialState = DrawerState.Closed
}) => {
  const { height } = Dimensions.get('window');
  const y = useRef(new Animated.Value(DrawerState.Closed)).current;
  const state = useRef(new Animated.Value(DrawerState.Closed)).current;
  const margin = 0.05 * height;
  const movementValue = (moveY: number) => height - moveY;

  useEffect(() => {
    animateMove(y, initialState);
  }, []);

  const onPanResponderMove = (
    _: GestureResponderEvent,
    { moveY }: PanResponderGestureState
  ) => {
    const val = movementValue(moveY);
    animateMove(y, val);
  };

  const onPanResponderRelease = (
    _: GestureResponderEvent,
    { moveY }: PanResponderGestureState
  ) => {
    const valueToMove = movementValue(moveY);
    // @ts-ignore
    const nextState = getNextState(state._value, valueToMove, margin);
    state.setValue(nextState);
    animateMove(y, nextState, onDrawerStateChange(nextState));
  };
  const onMoveShouldSetPanResponder = (
    _: GestureResponderEvent,
    { dy }: PanResponderGestureState
  ) => Math.abs(dy) >= 10;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder,
      onStartShouldSetPanResponderCapture: onMoveShouldSetPanResponder,
      onPanResponderMove,
      onPanResponderRelease
    })
  ).current;

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          height: height,
          backgroundColor: '#fff',
          borderRadius: 25,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowRadius: 15,
          shadowOpacity: 0.25,
          bottom: -height + 30,
          transform: [{ translateY: y }]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <HorizontalLine />
      {children}
    </Animated.View>
  );
};
