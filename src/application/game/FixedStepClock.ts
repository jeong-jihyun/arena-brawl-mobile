export type FixedStepClockOptions = {
  stepSeconds?: number;
  maxFrameSeconds?: number;
  maxStepsPerFrame?: number;
};

/**
 * Converts variable render-frame deltas into deterministic simulation steps.
 * Excessively long frames are capped and catch-up work is bounded.
 */
export class FixedStepClock {
  private accumulator = 0;
  private readonly stepSeconds: number;
  private readonly maxFrameSeconds: number;
  private readonly maxStepsPerFrame: number;

  constructor(options: FixedStepClockOptions = {}) {
    this.stepSeconds = options.stepSeconds ?? 1 / 60;
    this.maxFrameSeconds = options.maxFrameSeconds ?? 0.25;
    this.maxStepsPerFrame = options.maxStepsPerFrame ?? 5;
    if (this.stepSeconds <= 0 || this.maxFrameSeconds <= 0 || this.maxStepsPerFrame < 1) {
      throw new Error('FixedStepClock options must be positive.');
    }
  }

  advance(deltaSeconds: number, step: (seconds: number) => void): number {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 0;
    this.accumulator += Math.min(deltaSeconds, this.maxFrameSeconds);
    let steps = 0;
    while (this.accumulator >= this.stepSeconds && steps < this.maxStepsPerFrame) {
      step(this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      steps += 1;
    }
    if (steps === this.maxStepsPerFrame && this.accumulator >= this.stepSeconds) {
      this.accumulator %= this.stepSeconds;
    }
    return steps;
  }

  reset(): void {
    this.accumulator = 0;
  }
}
