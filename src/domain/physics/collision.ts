import type { Obstacle, Vec2 } from '../../game/types';

/** Exact circle-vs-axis-aligned-rectangle overlap using the closest point. */
export function circleIntersectsRect(
  center: Vec2,
  radius: number,
  rect: Obstacle,
): boolean {
  const closestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height));
  const dx = center.x - closestX;
  const dy = center.y - closestY;
  return dx * dx + dy * dy < radius * radius;
}

/** True when a point is inside an arena after accounting for its radius. */
export function circleIsInsideBounds(
  center: Vec2,
  radius: number,
  width: number,
  height: number,
): boolean {
  return center.x >= radius &&
    center.y >= radius &&
    center.x <= width - radius &&
    center.y <= height - radius;
}
