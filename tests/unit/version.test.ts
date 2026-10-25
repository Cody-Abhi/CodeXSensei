import { describe, expect, it } from 'vitest';

import { APP_NAME, APP_TAGLINE, APP_VERSION, buildGreeting } from '../../src/shared/version';

describe('version', () => {
  it('exposes brand constants', () => {
    expect(APP_NAME).toBe('PlanPop');
    expect(APP_TAGLINE).toMatch(/stress zero/i);
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  describe('buildGreeting', () => {
    it('includes a trimmed event name', () => {
      expect(buildGreeting('  Aisha & Rohan  ')).toBe('Planning: Aisha & Rohan');
    });

    it('falls back when the name is empty or whitespace', () => {
      expect(buildGreeting('')).toBe('Planning your event');
      expect(buildGreeting('   ')).toBe('Planning your event');
    });
  });
});
