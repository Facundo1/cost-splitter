import { describe, expect, it } from 'vitest';
import { convertCents, formatCents, isAmountInput, parseAmountToCents } from './money';

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

describe('formatCents', () => {
  it('formats with currency symbol and sign', () => {
    expect(formatCents(1050)).toMatch(/^\$10[.,]50$/);
    expect(formatCents(-1050)).toMatch(/^-\$10[.,]50$/);
  });

  it('uses a distinct label for pesos and euros', () => {
    expect(formatCents(1050, 'EUR')).toMatch(/^€10[.,]50$/);
    expect(formatCents(1050, 'ARS').replace(/\s/g, ' ')).toBe('ARS 10.50');
  });
});

describe('convertCents', () => {
  it('rounds a display conversion to the nearest cent', () => {
    expect(convertCents(100, 0.9)).toBe(90);
    expect(convertCents(101, 0.5)).toBe(51);
    expect(convertCents(100, Number.NaN)).toBe(100);
  });
});

describe('isAmountInput', () => {
  it.each(['', '1', '12.', '12,5', '12.50'])('accepts partial amount %j', (input) => {
    expect(isAmountInput(input)).toBe(true);
  });

  it.each(['a', '12a', '1.234', '1..2', '1.2.3', '-1', '1 2', '1e3'])('rejects %j', (input) => {
    expect(isAmountInput(input)).toBe(false);
  });
});
