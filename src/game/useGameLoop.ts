import { useCallback, useEffect, useRef, useState } from 'react';
import { createGame, resizeGame, triggerSpecial, updateGame } from './engine';
import type { GameState, Vec2 } from './types';

function copyState(state: GameState): GameState {
  return {
    ...state,
    player: { ...state.player },
    enemies: state.enemies.map((enemy) => ({ ...enemy })),
    bullets: state.bullets.map((bullet) => ({ ...bullet, velocity: { ...bullet.velocity } })),
    obstacles: state.obstacles.map((obstacle) => ({ ...obstacle })),
    joystick: { ...state.joystick },
  };
}

export function useGameLoop(width: number, height: number) {
  const engine = useRef<GameState>(createGame(Math.max(width, 1), Math.max(height, 1)));
  const [snapshot, setSnapshot] = useState(() => copyState(engine.current));

  useEffect(() => {
    const state = engine.current;
    const nextWidth = Math.max(width, 1);
    const nextHeight = Math.max(height, 1);
    if (state.width !== nextWidth || state.height !== nextHeight) {
      resizeGame(state, nextWidth, nextHeight);
    }
  }, [width, height]);

  useEffect(() => {
    let frame = 0;
    let previous = 0;
    let raf = 0;
    const tick = (time: number) => {
      if (previous) updateGame(engine.current, (time - previous) / 1000);
      previous = time;
      if (frame % 2 === 0) setSnapshot(copyState(engine.current));
      frame += 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setJoystick = useCallback((value: Vec2) => {
    engine.current.joystick = value;
  }, []);
  const setAttacking = useCallback((value: boolean) => {
    engine.current.attacking = value;
  }, []);
  const start = useCallback(() => {
    engine.current = createGame(Math.max(width, 1), Math.max(height, 1));
    engine.current.status = 'playing';
    setSnapshot(copyState(engine.current));
  }, [width, height]);
  const special = useCallback(() => {
    triggerSpecial(engine.current);
    setSnapshot(copyState(engine.current));
  }, []);

  return { game: snapshot, setJoystick, setAttacking, start, special };
}