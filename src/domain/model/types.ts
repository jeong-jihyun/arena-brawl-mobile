export type Vec2 = { x: number; y: number };
export type Actor = Vec2 & { radius: number; hp: number; maxHp: number; cooldown: number };
export type Bullet = Vec2 & { velocity: Vec2; radius: number; life: number; owner: 'player' | 'enemy'; damage: number };
export type Obstacle = { x: number; y: number; width: number; height: number };
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';
export type GameState = {
  width: number;
  height: number;
  player: Actor;
  enemies: (Actor & { speed: number; phase: number })[];
  bullets: Bullet[];
  obstacles: Obstacle[];
  score: number;
  status: GameStatus;
  joystick: Vec2;
  attacking: boolean;
  specialReady: boolean;
  specialCooldown: number;
};