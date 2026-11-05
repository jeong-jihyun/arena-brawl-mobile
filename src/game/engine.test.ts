import { describe, expect, it } from 'vitest';
import { createGame, resizeGame, triggerSpecial, updateGame } from './engine';
import { circleIntersectsRect } from '../domain/physics/collision';

describe('arena game engine', () => {
  it('creates a ready arena with one player and five enemies', () => {
    const game = createGame(800, 420);
    expect(game.status).toBe('ready');
    expect(game.player.hp).toBe(100);
    expect(game.enemies).toHaveLength(5);
    expect(game.obstacles).toHaveLength(4);
  });

  it('spawns enemies outside obstacles and away from the player', () => {
    const game = createGame(800, 420);

    for (const enemy of game.enemies) {
      expect(
        game.obstacles.some((obstacle) =>
          circleIntersectsRect({ x: enemy.x, y: enemy.y }, enemy.radius, obstacle)
        ),
      ).toBe(false);
      expect(Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y))
        .toBeGreaterThan(enemy.radius + game.player.radius);
    }

    for (let i = 0; i < game.enemies.length; i += 1) {
      for (let j = i + 1; j < game.enemies.length; j += 1) {
        const a = game.enemies[i];
        const b = game.enemies[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(a.radius + b.radius);
      }
    }
  });

  it('keeps obstacles inside a compact landscape arena', () => {
    const game = createGame(420, 180);
    for (const obstacle of game.obstacles) {
      expect(obstacle.x).toBeGreaterThanOrEqual(0);
      expect(obstacle.y).toBeGreaterThanOrEqual(0);
      expect(obstacle.x + obstacle.width).toBeLessThanOrEqual(game.width);
      expect(obstacle.y + obstacle.height).toBeLessThanOrEqual(game.height);
    }
    expect(game.enemies).toHaveLength(5);
  });

  it('does not advance gameplay before the match starts', () => {
    const game = createGame(800, 420);
    const initialX = game.player.x;
    game.joystick = { x: 1, y: 0 };
    updateGame(game, 0.05);
    expect(game.player.x).toBe(initialX);
    expect(game.enemies).toHaveLength(5);
  });

  it('moves the player when a match is active', () => {
    const game = createGame(800, 420);
    game.status = 'playing';
    const initialX = game.player.x;
    game.joystick = { x: 1, y: 0 };
    updateGame(game, 0.05);
    expect(game.player.x).toBeGreaterThan(initialX);
  });

  it('fires player projectiles while attack is held', () => {
    const game = createGame(800, 420);
    game.status = 'playing';
    game.attacking = true;
    updateGame(game, 0.05);
    expect(game.bullets.some((bullet) => bullet.owner === 'player')).toBe(true);
  });

  it('applies the special attack and starts its cooldown', () => {
    const game = createGame(800, 420);
    game.status = 'playing';
    const target = game.enemies[0];
    target.x = game.player.x + 80;
    target.y = game.player.y;
    triggerSpecial(game);
    expect(target.hp).toBe(22);
    expect(game.specialReady).toBe(false);
    expect(game.specialCooldown).toBe(7);
  });

  it('rescales actors and rebuilds obstacles after an orientation change', () => {
    const game = createGame(800, 420);
    const oldPlayerX = game.player.x;
    resizeGame(game, 420, 800);
    expect(game.width).toBe(420);
    expect(game.height).toBe(800);
    expect(game.player.x).toBeCloseTo(oldPlayerX * 0.525);
    expect(game.obstacles[0].x).toBeCloseTo(420 * 0.22);
  });

  it('keeps actors inside the new arena and scales active projectiles on resize', () => {
    const game = createGame(800, 420);
    game.player.x = 20;
    game.player.y = 20;
    game.bullets.push({
      x: 400,
      y: 210,
      velocity: { x: 100, y: -50 },
      radius: 5,
      life: 1,
      owner: 'player',
      damage: 25,
    });

    resizeGame(game, 200, 100);

    expect(game.player.x).toBeGreaterThanOrEqual(game.player.radius);
    expect(game.player.y).toBeGreaterThanOrEqual(game.player.radius);
    expect(game.player.x).toBeLessThanOrEqual(200 - game.player.radius);
    expect(game.player.y).toBeLessThanOrEqual(100 - game.player.radius);
    expect(game.bullets[0].x).toBe(100);
    expect(game.bullets[0].y).toBe(50);
    expect(game.bullets[0].velocity.x).toBe(25);
    expect(game.bullets[0].velocity.y).toBeCloseTo(-50 / 4.2);
  });

  it('ends the match when the player health reaches zero', () => {
    const game = createGame(800, 420);
    game.status = 'playing';
    game.player.hp = 1;
    game.bullets.push({
      x: game.player.x,
      y: game.player.y,
      velocity: { x: 0, y: 0 },
      radius: 5,
      life: 1,
      owner: 'enemy',
      damage: 9,
    });
    updateGame(game, 0.01);
    expect(game.player.hp).toBe(0);
    expect(game.status).toBe('lost');
  });
});
