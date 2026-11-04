import { describe, expect, it } from 'vitest';
import { parseAmountToCents } from './money';

describe('parseAmountToCents', () => {
  it.each([
    ['10', 1000],
    ['10.5', 1050],
    ['10.50', 1050],
    ['10,50', 1050],
    ['0.01', 1],
    ['  42  ', 4200],
  ])('parses %j as %i cents', (input, expected) => {
    expect(parseAmountToCents(input)).toBe(expected);
  });

  it('avoids float rounding errors (0.1 + 0.2 style)', () => {
    expect(parseAmountToCents('19.99')).toBe(1999);
    expect(parseAmountToCents('1.15')).toBe(115);
  });

  it.each(['', 'abc', '-5', '0', '0.00', '1.234', '1e3', '1.2.3'])('rejects %j', (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });
});
