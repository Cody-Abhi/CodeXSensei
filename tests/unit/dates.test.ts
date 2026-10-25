import { describe, expect, it } from 'vitest';

import {
  addDays,
  backSchedule,
  daysBetween,
  daysUntil,
  isFutureISODate,
  parseISODate,
  toISODate,
} from '../../src/shared/dates';

const NOW = new Date('2026-01-01T12:00:00Z');

describe('date helpers', () => {
  it('toISODate returns a YYYY-MM-DD string in UTC', () => {
    expect(toISODate(new Date('2026-03-15T23:30:00Z'))).toBe('2026-03-15');
  });

  it('parseISODate parses and throws on invalid input', () => {
    expect(toISODate(parseISODate('2026-03-15'))).toBe('2026-03-15');
    expect(() => parseISODate('not-a-date')).toThrow(RangeError);
  });

  it('addDays shifts by whole days', () => {
    expect(toISODate(addDays(new Date('2026-03-15T00:00:00Z'), -10))).toBe('2026-03-05');
    expect(toISODate(addDays(new Date('2026-03-15T00:00:00Z'), 10))).toBe('2026-03-25');
  });

  it('daysBetween counts whole calendar days', () => {
    expect(daysBetween(new Date('2026-03-01T00:00:00Z'), new Date('2026-03-08T00:00:00Z'))).toBe(7);
    expect(daysBetween(new Date('2026-03-08T00:00:00Z'), new Date('2026-03-01T00:00:00Z'))).toBe(
      -7,
    );
  });

  it('daysUntil measures from a reference date', () => {
    expect(daysUntil('2026-01-08', NOW)).toBe(7);
  });

  describe('isFutureISODate', () => {
    it('accepts a future date', () => {
      expect(isFutureISODate('2026-06-01', NOW)).toBe(true);
    });
    it('rejects today and past dates', () => {
      expect(isFutureISODate('2026-01-01', NOW)).toBe(false);
      expect(isFutureISODate('2025-12-31', NOW)).toBe(false);
    });
    it('rejects invalid input', () => {
      expect(isFutureISODate('nonsense', NOW)).toBe(false);
    });
  });

  describe('backSchedule', () => {
    it('schedules milestones before the event, earliest first', () => {
      const result = backSchedule('2026-06-01', [
        { id: 'a', title: 'A', phase: 'late', offsetDays: 7 },
        { id: 'b', title: 'B', phase: 'early', offsetDays: 60 },
      ]);
      expect(result.map((m) => m.id)).toEqual(['b', 'a']);
      expect(result[0]?.dueDate).toBe('2026-04-02');
      expect(result[1]?.dueDate).toBe('2026-05-25');
      expect(result.every((m) => m.done === false)).toBe(true);
    });

    it('keeps equal due dates stable', () => {
      const result = backSchedule('2026-06-01', [
        { id: 'a', title: 'A', phase: 'p', offsetDays: 10 },
        { id: 'b', title: 'B', phase: 'p', offsetDays: 10 },
      ]);
      expect(result.map((m) => m.dueDate)).toEqual(['2026-05-22', '2026-05-22']);
    });
  });
});
