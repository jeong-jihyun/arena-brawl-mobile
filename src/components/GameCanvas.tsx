import React from 'react';
import { Canvas, Circle, Line, RoundedRect } from '@shopify/react-native-skia';
import type { GameState } from '../game/types';
import { palette } from '../theme';

type Props = { game: GameState; width: number; height: number };

export function GameCanvas({ game, width, height }: Props) {
  return (
    <Canvas style={{ width, height }}>
      <RoundedRect x={0} y={0} width={width} height={height} r={18} color={palette.arena} />
      {Array.from({ length: 11 }, (_, i) => (
        <Line key={`v${i}`} p1={{ x: (width / 10) * i, y: 0 }} p2={{ x: (width / 10) * i, y: height }} color={palette.arenaGrid} strokeWidth={1} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Line key={`h${i}`} p1={{ x: 0, y: (height / 7) * i }} p2={{ x: width, y: (height / 7) * i }} color={palette.arenaGrid} strokeWidth={1} />
      ))}
      {game.obstacles.map((o, i) => (
        <RoundedRect key={i} x={o.x} y={o.y} width={o.width} height={o.height} r={10} color={palette.wall} />
      ))}
      {game.bullets.map((b, i) => (
        <Circle key={`b${i}`} cx={b.x} cy={b.y} r={b.radius} color={b.owner === 'player' ? palette.bullet : palette.enemy} />
      ))}
      {game.enemies.map((enemy, i) => (
        <React.Fragment key={`e${i}`}>
          <Circle cx={enemy.x} cy={enemy.y} r={enemy.radius + 3} color="#7f303b" />
          <Circle cx={enemy.x} cy={enemy.y} r={enemy.radius} color={palette.enemy} />
          <RoundedRect x={enemy.x - 20} y={enemy.y - 30} width={40} height={5} r={2} color="#552b35" />
          <RoundedRect x={enemy.x - 20} y={enemy.y - 30} width={40 * Math.max(0, enemy.hp / enemy.maxHp)} height={5} r={2} color="#8df0a8" />
        </React.Fragment>
      ))}
      <Circle cx={game.player.x} cy={game.player.y} r={game.player.radius + 5} color="#24556b" />
      <Circle cx={game.player.x} cy={game.player.y} r={game.player.radius} color={palette.player} />
      <Circle cx={game.player.x - 6} cy={game.player.y - 3} r={3} color="#123344" />
      <Circle cx={game.player.x + 6} cy={game.player.y - 3} r={3} color="#123344" />
    </Canvas>
  );
}