import type { CurrencyCode } from '../lib/currency';
import type { RateQuote } from './currencyApi';

const KEY = 'split-it:last-rate';

export function readLastQuote(from: CurrencyCode, to: CurrencyCode): RateQuote | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RateQuote>;
    if (parsed.from !== from || parsed.to !== to) return null;
    if (typeof parsed.rate !== 'number' || !Number.isFinite(parsed.rate) || parsed.rate <= 0) return null;
    if (typeof parsed.asOf !== 'string') return null;
    return { from, to, rate: parsed.rate, asOf: parsed.asOf };
  } catch {
    return null;
  }
}

export function writeLastQuote(quote: RateQuote): void {
  localStorage.setItem(KEY, JSON.stringify(quote));
}
