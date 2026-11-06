import { describe, expect, it } from 'vitest';
import { circleIntersectsRect, circleIsInsideBounds } from './collision';

describe('collision geometry', () => {
  const rect = { x: 10, y: 10, width: 20, height: 20 };

  it('detects overlap with a rectangle face', () => {
    expect(circleIntersectsRect({ x: 9, y: 20 }, 2, rect)).toBe(true);
  });

  it('detects overlap with a rectangle corner only when the circle reaches it', () => {
    expect(circleIntersectsRect({ x: 8.8, y: 8.8 }, 1.5, rect)).toBe(false);
    expect(circleIntersectsRect({ x: 9, y: 9 }, 1.5, rect)).toBe(true);
  });

  it('treats tangent contact as non-overlap', () => {
    expect(circleIntersectsRect({ x: 8, y: 20 }, 2, rect)).toBe(false);
  });

  it('checks arena bounds using the complete circle radius', () => {
    expect(circleIsInsideBounds({ x: 20, y: 20 }, 5, 100, 80)).toBe(true);
    expect(circleIsInsideBounds({ x: 4, y: 20 }, 5, 100, 80)).toBe(false);
    expect(circleIsInsideBounds({ x: 96, y: 20 }, 5, 100, 80)).toBe(false);
  });
});
