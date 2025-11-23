import { describe, it, expect } from 'vitest';
import { colorForCI, colorForCount } from '../lib/colorMapping';

const cfg = {
  ciThresholds: { greenMin: 0.66, yellowMin: 0.33 },
  caps: { maxR: 50, maxC: 30, maxA: 20 },
};

describe('colorForCI', () => {
  it('maps high CI to green', () => {
    expect(colorForCI(0.9, cfg)).toBe('green');
  });
  it('maps mid CI to yellow', () => {
    expect(colorForCI(0.5, cfg)).toBe('yellow');
  });
  it('maps low CI to red', () => {
    expect(colorForCI(0.1, cfg)).toBe('red');
  });
});

describe('colorForCount', () => {
  it('maps low ratio to green (better)', () => {
    expect(colorForCount('R', 0, cfg)).toBe('green');
  });
  it('maps mid ratio to yellow', () => {
    // mid relative to inverse thresholds
    const mid = cfg.caps.maxR * (1 - cfg.ciThresholds.greenMin + 0.05);
    expect(colorForCount('R', mid, cfg)).toBe('yellow');
  });
  it('maps high ratio to red', () => {
    expect(colorForCount('R', cfg.caps.maxR, cfg)).toBe('red');
  });
});