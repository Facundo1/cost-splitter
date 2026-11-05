import { parseLedgerBackup, serializeLedger } from './backup';
import type { Ledger } from './ledger';

export function encodeGroupParam(ledger: Ledger): string {
  const bytes = new TextEncoder().encode(serializeLedger(ledger));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

export function ledgerFromSearch(search: string): Ledger | null {
  const param = new URLSearchParams(search).get('g');
  if (!param) return null;
  try {
    const base64 = param.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return parseLedgerBackup(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
