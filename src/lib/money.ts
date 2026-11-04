import type { CurrencyCode } from './currency';

export function parseAmountToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [whole = '', fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function isAmountInput(input: string): boolean {
  return /^\d*([.,]\d{0,2})?$/.test(input);
}

const formatters = new Map<CurrencyCode, Intl.NumberFormat>();

function formatter(currency: CurrencyCode): Intl.NumberFormat {
  const existing = formatters.get(currency);
  if (existing) return existing;
  const created = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    currencyDisplay: currency === 'ARS' ? 'code' : 'narrowSymbol',
  });
  formatters.set(currency, created);
  return created;
}

export function centsToInput(cents: number): string {
  const absolute = Math.abs(cents);
  return `${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}

export function formatCents(cents: number, currency: CurrencyCode = 'USD'): string {
  return formatter(currency).format(cents / 100);
}

export function convertCents(cents: number, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return cents;
  return Math.round(cents * rate);
}
