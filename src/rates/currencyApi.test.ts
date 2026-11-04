import { describe, expect, it } from 'vitest';
import { createCurrencyApiReader, parseCurrencyApi } from './currencyApi';
import { readLastQuote, writeLastQuote } from './lastQuote';

describe('parseCurrencyApi', () => {
  it('reads the rate for the requested pair', () => {
    expect(parseCurrencyApi('USD', 'EUR', { date: '2026-11-04', usd: { eur: 0.9 } })).toEqual({
      from: 'USD',
      to: 'EUR',
      rate: 0.9,
      asOf: '2026-11-04',
    });
  });

  it('rejects a payload without that pair', () => {
    expect(parseCurrencyApi('USD', 'ARS', { date: '2026-11-04', usd: {} })).toBeNull();
    expect(parseCurrencyApi('USD', 'EUR', null)).toBeNull();
  });
});

describe('createCurrencyApiReader', () => {
  it('uses the first host that returns a rate', async () => {
    const calls: string[] = [];
    const reader = createCurrencyApiReader(async (url) => {
      calls.push(url);
      if (calls.length === 1) throw new Error('down');
      return { date: '2026-11-04', eur: { ars: 1400 } };
    });
    await expect(reader.latest('EUR', 'ARS')).resolves.toMatchObject({ rate: 1400, asOf: '2026-11-04' });
    expect(calls).toHaveLength(2);
  });

  it('fails when neither host has the pair', async () => {
    const reader = createCurrencyApiReader(async () => ({ date: '2026-11-04', usd: {} }));
    await expect(reader.latest('USD', 'ARS')).rejects.toThrow(/unavailable/i);
  });
});

describe('last quote', () => {
  it('remembers a quote only for the same pair', () => {
    writeLastQuote({ from: 'USD', to: 'EUR', rate: 0.9, asOf: '2026-11-04' });
    expect(readLastQuote('USD', 'EUR')).toMatchObject({ rate: 0.9 });
    expect(readLastQuote('USD', 'ARS')).toBeNull();
  });

  it('ignores a broken save', () => {
    localStorage.setItem('split-it:last-rate', '{nope');
    expect(readLastQuote('USD', 'EUR')).toBeNull();
  });
});
