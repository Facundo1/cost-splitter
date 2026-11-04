import { useEffect, useState } from 'react';
import type { CurrencyCode } from '../lib/currency';
import { currencyApi, type RateQuote } from './currencyApi';
import { readLastQuote, writeLastQuote } from './lastQuote';

export type QuoteStatus = 'idle' | 'loading' | 'fresh' | 'stale' | 'missing';

interface QuoteResult {
  key: string;
  quote: RateQuote | null;
  status: QuoteStatus;
}

const idleResult: QuoteResult = { key: '', quote: null, status: 'idle' };

export function useExchangeQuote(from: CurrencyCode, to: CurrencyCode | '') {
  const [result, setResult] = useState<QuoteResult>(idleResult);
  const requested = to !== '' && to !== from;
  const key = requested ? `${from}:${to}` : '';
  const current = result.key === key ? result : { key, quote: null, status: requested ? 'loading' : 'idle' };

  useEffect(() => {
    if (to === '' || to === from) return;
    const requestKey = `${from}:${to}`;
    let cancelled = false;

    const load = async () => {
      try {
        const next = await currencyApi.latest(from, to);
        if (cancelled) return;
        writeLastQuote(next);
        setResult({ key: requestKey, quote: next, status: 'fresh' });
      } catch {
        if (cancelled) return;
        const saved = readLastQuote(from, to);
        setResult({ key: requestKey, quote: saved, status: saved ? 'stale' : 'missing' });
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return { quote: current.quote, status: current.status as QuoteStatus };
}
