import type { Actor, GameState, Vec2 } from '../domain/model/types';
import { circleIntersectsRect } from '../domain/physics/collision';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

function makeActor(x: number, y: number, hp: number): Actor {
  return { x, y, radius: 19, hp, maxHp: hp, cooldown: 0 };
}

function createObstacles(width: number, height: number) {
  const scaleWidth = Math.min(1, Math.max(0.12, width / 560));
  const scaleHeight = Math.min(1, Math.max(0.12, height / 210));
  return [
    { x: width * 0.22, y: height * 0.22, width: 78 * scaleWidth, height: 54 * scaleHeight },
    { x: width * 0.70, y: height * 0.20, width: 90 * scaleWidth, height: 58 * scaleHeight },
    { x: width * 0.23, y: height * 0.68, width: 90 * scaleWidth, height: 54 * scaleHeight },
    { x: width * 0.69, y: height * 0.68, width: 78 * scaleWidth, height: 58 * scaleHeight },
  ];
}

function findFreeSpawn(
  preferred: Vec2,
  width: number,
  height: number,
  obstacles: GameState['obstacles'],
  occupied: Array<{ position: Vec2; radius: number }>,
  radius: number,
): Vec2 {
  const minX = Math.min(radius, width / 2);
  const maxX = Math.max(minX, width - radius);
  const minY = Math.min(radius, height / 2);
  const maxY = Math.max(minY, height - radius);
  const step = radius * 2 + 8;
  const candidates: Vec2[] = [];

  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      const point = { x, y };
      const blocked = obstacles.some((obstacle) => circleIntersectsRect(point, radius, obstacle));
      const crowded = occupied.some((other) => distance(point, other.position) < radius + other.radius + 8);
      if (!blocked && !crowded) candidates.push(point);
    }
  }

  candidates.sort((a, b) => distance(a, preferred) - distance(b, preferred));
  if (candidates.length) return candidates[0];

  return {
    x: clamp(preferred.x, minX, maxX),
    y: clamp(preferred.y, minY, maxY),
  };
}

export function createGame(width: number, height: number): GameState {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const obstacles = createObstacles(safeWidth, safeHeight);
  const player = makeActor(safeWidth / 2, safeHeight / 2, 100);
  const occupied = [{ position: player, radius: player.radius }];
  const enemies: GameState['enemies'] = [];

  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5;
    const preferred = {
      x: safeWidth / 2 + Math.cos(angle) * safeWidth * 0.31,
      y: safeHeight / 2 + Math.sin(angle) * safeHeight * 0.31,
    };
    const position = findFreeSpawn(preferred, safeWidth, safeHeight, obstacles, occupied, 19);
    const enemy = {
      ...makeActor(position.x, position.y, 70),
      speed: 48 + (i % 3) * 8,
      phase: i,
    };
    enemies.push(enemy);
    occupied.push({ position: enemy, radius: enemy.radius });
  }

  return {
    width: safeWidth, height: safeHeight, obstacles,
    player, enemies, bullets: [], score: 0, status: 'ready',
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
  state.obstacles = createObstacles(nextWidth, nextHeight);

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