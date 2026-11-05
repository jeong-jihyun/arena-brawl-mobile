import { describe, expect, it, vi } from 'vitest';
import { FixedStepClock } from './FixedStepClock';

describe('FixedStepClock', () => {
  it('splits a frame into fixed simulation steps', () => {
    const clock = new FixedStepClock({ stepSeconds: 0.01 });
    const step = vi.fn();
    expect(clock.advance(0.025, step)).toBe(2);
    expect(step).toHaveBeenCalledTimes(2);
    expect(step).toHaveBeenCalledWith(0.01);
    expect(clock.advance(0.005, step)).toBe(1);
  });

  it('bounds catch-up work after a long frame', () => {
    const clock = new FixedStepClock({
      stepSeconds: 0.01,
      maxFrameSeconds: 1,
      maxStepsPerFrame: 3,
    });
    const step = vi.fn();
    expect(clock.advance(0.5, step)).toBe(3);
    expect(step).toHaveBeenCalledTimes(3);
  });

  it('ignores invalid or non-positive frame deltas', () => {
    const clock = new FixedStepClock();
    const step = vi.fn();
    expect(clock.advance(Number.NaN, step)).toBe(0);
    expect(clock.advance(-1, step)).toBe(0);
    expect(clock.advance(0, step)).toBe(0);
    expect(step).not.toHaveBeenCalled();
  });

  it('clears accumulated time when reset', () => {
    const clock = new FixedStepClock({ stepSeconds: 0.01 });
    const step = vi.fn();
    clock.advance(0.006, step);
    clock.reset();
    expect(clock.advance(0.005, step)).toBe(0);
  });
});
