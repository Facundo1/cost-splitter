/** Parses "12", "12.5" or "12,50" into integer cents. Returns null if not a positive amount. */
export function parseAmountToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [whole = '', fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

/** True while the input can still become a valid amount: digits, one `.`/`,`, ≤ 2 decimals. */
export function isAmountInput(input: string): boolean {
  return /^\d*([.,]\d{0,2})?$/.test(input);
}

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${formatter.format(Math.abs(cents) / 100)}`;
}
