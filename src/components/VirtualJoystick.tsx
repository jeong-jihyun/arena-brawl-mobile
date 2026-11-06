import React, { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import type { Vec2 } from '../game/types';

type Props = { onChange: (value: Vec2) => void };
const SIZE = 116;
const RADIUS = 42;

export function VirtualJoystick({ onChange }: Props) {
  const origin = useRef({ x: 0, y: 0 });
  const [knob, setKnob] = React.useState<Vec2>({ x: 0, y: 0 });
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      origin.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
    },
    onPanResponderMove: (_, gesture) => {
      const dx = gesture.dx;
      const dy = gesture.dy;
      const length = Math.hypot(dx, dy);
      const scale = length > RADIUS ? RADIUS / length : 1;
      const next = { x: dx * scale, y: dy * scale };
      setKnob(next);
      onChange({ x: next.x / RADIUS, y: next.y / RADIUS });
    },
    onPanResponderRelease: () => {
      setKnob({ x: 0, y: 0 });
      onChange({ x: 0, y: 0 });
    },
    onPanResponderTerminate: () => {
      setKnob({ x: 0, y: 0 });
      onChange({ x: 0, y: 0 });
    },
  }), [onChange]);

  return (
    <View style={styles.base} {...responder.panHandlers}>
      <View style={[styles.knob, { transform: [{ translateX: knob.x }, { translateY: knob.y }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    backgroundColor: '#dceeff22', borderWidth: 2, borderColor: '#ffffff66',
    alignItems: 'center', justifyContent: 'center',
  },
  knob: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#eaf6ffcc', borderWidth: 2, borderColor: '#ffffff',
  },
});