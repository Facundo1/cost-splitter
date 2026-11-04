import { describe, expect, it } from 'vitest';
import { formatDay } from './day';

describe('formatDay', () => {
  it('formats a calendar date in English without shifting the day', () => {
    expect(formatDay('2026-11-04')).toBe('November 4, 2026');
    expect(formatDay('nope')).toBe('nope');
  });
});
