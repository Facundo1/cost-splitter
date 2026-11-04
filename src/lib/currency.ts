export const CURRENCIES = ['USD', 'ARS', 'EUR'] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const CURRENCY_NAME: Record<CurrencyCode, string> = {
  USD: 'US dollars',
  ARS: 'Argentine pesos',
  EUR: 'euros',
};

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}
