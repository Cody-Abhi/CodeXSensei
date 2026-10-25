import { describe, expect, it } from 'vitest';

import {
  formatMinor,
  isOverspent,
  normaliseBudget,
  percentOf,
  sumMinor,
  toMinor,
} from '../../src/shared/money';

describe('money helpers', () => {
  it('toMinor rounds to integer minor units', () => {
    expect(toMinor(15)).toBe(1500);
    expect(toMinor(25.5)).toBe(2550);
    expect(toMinor(0.1 + 0.2)).toBe(30); // no float drift
  });

  it('sumMinor adds integers', () => {
    expect(sumMinor([100, 200, 300])).toBe(600);
    expect(sumMinor([])).toBe(0);
  });

  it('percentOf rounds and guards non-positive wholes', () => {
    expect(percentOf(3, 8)).toBe(38);
    expect(percentOf(1, 0)).toBe(0);
    expect(percentOf(5, -10)).toBe(0);
  });

  it('isOverspent compares actual against planned', () => {
    expect(isOverspent(101, 100)).toBe(true);
    expect(isOverspent(100, 100)).toBe(false);
  });

  describe('normaliseBudget', () => {
    it('returns an empty array for no categories', () => {
      expect(normaliseBudget([], 1000)).toEqual([]);
    });

    it('scales proportionally and sums to the total exactly', () => {
      const result = normaliseBudget([30, 25, 12, 10, 8, 5, 5, 5], 1_500_000);
      expect(sumMinor(result)).toBe(1_500_000);
      expect(result.every((n) => Number.isInteger(n))).toBe(true);
      // largest weight remains the largest amount
      expect(Math.max(...result)).toBe(result[0]);
    });

    it('distributes evenly when all weights are zero', () => {
      const result = normaliseBudget([0, 0, 0], 100);
      expect(sumMinor(result)).toBe(100);
      // remainder of 1 goes to the first bucket
      expect(result).toEqual([34, 33, 33]);
    });

    it('clamps a negative total to zero', () => {
      const result = normaliseBudget([1, 1], -50);
      expect(result).toEqual([0, 0]);
    });

    it('assigns the rounding remainder to the largest categories', () => {
      const result = normaliseBudget([2, 1], 10);
      expect(sumMinor(result)).toBe(10);
      expect(result[0]).toBeGreaterThanOrEqual(result[1] ?? 0);
    });
  });

  describe('formatMinor', () => {
    it('formats INR with the rupee symbol', () => {
      const out = formatMinor(1_500_000, 'INR');
      expect(out).toContain('₹');
      expect(out).toMatch(/15,000/);
    });

    it('formats USD with two fraction digits when asked', () => {
      expect(formatMinor(2550, 'USD', 2)).toMatch(/\$\s?25\.50/);
    });

    it('formats EUR with the euro symbol', () => {
      expect(formatMinor(10000, 'EUR')).toContain('€');
    });
  });
});
