import axios from 'axios';
import type { CurrencyCode } from '../lib/currency';

export interface RateQuote {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  asOf: string;
}

export interface ExchangeRateReader {
  latest(from: CurrencyCode, to: CurrencyCode): Promise<RateQuote>;
}

type GetJson = (url: string) => Promise<unknown>;

function sources(code: string): string[] {
  return [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.min.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${code}.min.json`,
  ];
}

export function parseCurrencyApi(from: CurrencyCode, to: CurrencyCode, payload: unknown): RateQuote | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const body = payload as Record<string, unknown>;
  const asOf = body.date;
  const table = body[from.toLowerCase()];
  if (typeof asOf !== 'string' || typeof table !== 'object' || table === null) return null;
  const rate = (table as Record<string, unknown>)[to.toLowerCase()];
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return null;
  return { from, to, rate, asOf };
}

export function createCurrencyApiReader(getJson: GetJson): ExchangeRateReader {
  return {
    async latest(from, to) {
      for (const url of sources(from.toLowerCase())) {
        try {
          const quote = parseCurrencyApi(from, to, await getJson(url));
          if (quote) return quote;
        } catch {
          continue;
        }
      }
      throw new Error('Exchange rate unavailable');
    },
  };
}

export const currencyApi = createCurrencyApiReader(async (url) => {
  const response = await axios.get<unknown>(url);
  return response.data;
});
