import type { Actor, GameState, Vec2 } from './types';
import { circleIntersectsRect } from '../domain/physics/collision';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

function makeActor(x: number, y: number, hp: number): Actor {
  return { x, y, radius: 19, hp, maxHp: hp, cooldown: 0 };
}

export function createGame(width: number, height: number): GameState {
  const obstacles = [
    { x: width * 0.22, y: height * 0.22, width: 78, height: 54 },
    { x: width * 0.70, y: height * 0.20, width: 90, height: 58 },
    { x: width * 0.23, y: height * 0.68, width: 90, height: 54 },
    { x: width * 0.69, y: height * 0.68, width: 78, height: 58 },
  ];
  const enemies = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5;
    return {
      ...makeActor(width / 2 + Math.cos(angle) * width * 0.31, height / 2 + Math.sin(angle) * height * 0.31, 70),
      speed: 48 + (i % 3) * 8,
      phase: i,
    };
  });
  return {
    width, height, obstacles,
    player: { ...makeActor(width / 2, height / 2, 100) },
    enemies, bullets: [], score: 0, status: 'ready',
    joystick: { x: 0, y: 0 }, attacking: false,
    specialReady: true, specialCooldown: 0,
  };
}

function collidesWithObstacle(x: number, y: number, radius: number, state: GameState) {
  return state.obstacles.some((obstacle) =>
    circleIntersectsRect({ x, y }, radius, obstacle)
  );
}

function fire(state: GameState, from: Vec2, to: Vec2, owner: 'player' | 'enemy', damage: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  state.bullets.push({
    x: from.x, y: from.y,
    velocity: { x: (dx / length) * 390, y: (dy / length) * 390 },
    radius: 5, life: 1.6, owner, damage,
  });
}

export function triggerSpecial(state: GameState) {
  if (state.status !== 'playing' || !state.specialReady) return;
  state.specialReady = false;
  state.specialCooldown = 7;
  state.enemies = state.enemies.filter((enemy) => {
    if (distance(state.player, enemy) < 155) enemy.hp -= 48;
    if (enemy.hp <= 0) { state.score += 100; return false; }
    return true;
  });
  if (state.enemies.length === 0) state.status = 'won';
}

export function updateGame(state: GameState, deltaSeconds: number) {
  if (state.status !== 'playing') return;
  const dt = Math.min(deltaSeconds, 0.05);
  const { player } = state;
  const inputLength = Math.hypot(state.joystick.x, state.joystick.y);
  if (inputLength > 0.05) {
    const nx = clamp(player.x + (state.joystick.x / Math.max(1, inputLength)) * 220 * dt, player.radius, state.width - player.radius);
    const ny = clamp(player.y + (state.joystick.y / Math.max(1, inputLength)) * 220 * dt, player.radius, state.height - player.radius);
    if (!collidesWithObstacle(nx, player.y, player.radius, state)) player.x = nx;
    if (!collidesWithObstacle(player.x, ny, player.radius, state)) player.y = ny;
  }

  player.cooldown = Math.max(0, player.cooldown - dt);
  state.specialCooldown = Math.max(0, state.specialCooldown - dt);
  if (state.specialCooldown === 0) state.specialReady = true;

  if (state.attacking && player.cooldown === 0 && state.enemies.length) {
    const target = state.enemies.reduce((best, enemy) =>
      distance(player, enemy) < distance(player, best) ? enemy : best
    );
    fire(state, player, target, 'player', 25);
    player.cooldown = 0.32;
  }

  state.enemies.forEach((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    enemy.phase += dt;
    if (d > 145) {
      const nx = clamp(enemy.x + (dx / d) * enemy.speed * dt, enemy.radius, state.width - enemy.radius);
      const ny = clamp(enemy.y + (dy / d) * enemy.speed * dt, enemy.radius, state.height - enemy.radius);
      if (!collidesWithObstacle(nx, enemy.y, enemy.radius, state)) enemy.x = nx;
      if (!collidesWithObstacle(enemy.x, ny, enemy.radius, state)) enemy.y = ny;
    }
    enemy.cooldown = Math.max(0, enemy.cooldown - dt);
    if (d < 330 && enemy.cooldown === 0) {
      fire(state, enemy, player, 'enemy', 9);
      enemy.cooldown = 1.15 + (enemy.phase % 0.4);
    }
  });

  state.bullets = state.bullets.filter((bullet) => {
    bullet.x += bullet.velocity.x * dt;
    bullet.y += bullet.velocity.y * dt;
    bullet.life -= dt;
    if (bullet.life <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > state.width || bullet.y > state.height) return false;
    if (collidesWithObstacle(bullet.x, bullet.y, bullet.radius, state)) return false;
    if (bullet.owner === 'player') {
      const target = state.enemies.find((enemy) => distance(enemy, bullet) < enemy.radius + bullet.radius);
      if (target) { target.hp -= bullet.damage; return false; }
    } else if (distance(player, bullet) < player.radius + bullet.radius) {
      player.hp -= bullet.damage;
      return false;
    }
    return true;
  });

  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.hp <= 0) { state.score += 100; return false; }
    return true;
  });
  if (state.enemies.length === 0) state.status = 'won';
  if (player.hp <= 0) { player.hp = 0; state.status = 'lost'; }
}

export function resizeGame(state: GameState, width: number, height: number) {
  const nextWidth = Math.max(1, width);
  const nextHeight = Math.max(1, height);
  const sx = nextWidth / Math.max(1, state.width);
  const sy = nextHeight / Math.max(1, state.height);

  state.width = nextWidth;
  state.height = nextHeight;
  state.obstacles = [
    { x: nextWidth * 0.22, y: nextHeight * 0.22, width: 78, height: 54 },
    { x: nextWidth * 0.70, y: nextHeight * 0.20, width: 90, height: 58 },
    { x: nextWidth * 0.23, y: nextHeight * 0.68, width: 90, height: 54 },
    { x: nextWidth * 0.69, y: nextHeight * 0.68, width: 78, height: 58 },
  ];

  const scaleActor = (actor: Actor) => {
    actor.x = clamp(actor.x * sx, actor.radius, nextWidth - actor.radius);
    actor.y = clamp(actor.y * sy, actor.radius, nextHeight - actor.radius);
  };
  scaleActor(state.player);
  state.enemies.forEach(scaleActor);

  state.bullets.forEach((bullet) => {
    bullet.x *= sx;
    bullet.y *= sy;
    bullet.velocity.x *= sx;
    bullet.velocity.y *= sy;
    bullet.x = clamp(bullet.x, 0, nextWidth);
    bullet.y = clamp(bullet.y, 0, nextHeight);
  });
}