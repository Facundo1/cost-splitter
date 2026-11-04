import { isCurrencyCode } from './currency';
import type { Ledger } from './ledger';
import type { Expense, Payment, Person, PersonId } from './types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePeople(value: unknown): Person[] | null {
  if (!Array.isArray(value)) return null;
  const people: Person[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return null;
    const name = item.name.trim();
    if (!item.id || !name || ids.has(item.id) || names.has(name.toLowerCase())) return null;
    ids.add(item.id);
    names.add(name.toLowerCase());
    people.push({ id: item.id, name });
  }
  return people;
}

function parseParts(value: unknown, participants: PersonId[]): Record<PersonId, number> | undefined | null {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return null;
  const parts: Record<PersonId, number> = {};
  for (const id of participants) {
    const part = value[id];
    if (part === undefined) continue;
    if (typeof part !== 'number' || !Number.isInteger(part) || part < 1 || part > 20) return null;
    parts[id] = part;
  }
  return Object.keys(parts).length > 0 ? parts : undefined;
}

function parseExpenses(value: unknown, ids: Set<string>): Expense[] | null {
  if (!Array.isArray(value)) return null;
  const expenses: Expense[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const { id, description, amountCents, paidBy, splitAmong, occurredOn } = item;
    if (typeof id !== 'string' || !id || typeof description !== 'string' || !description.trim()) return null;
    if (typeof amountCents !== 'number' || !Number.isSafeInteger(amountCents) || amountCents <= 0) return null;
    if (typeof paidBy !== 'string' || !ids.has(paidBy)) return null;
    if (!Array.isArray(splitAmong) || splitAmong.length === 0) return null;
    if (!splitAmong.every((personId) => typeof personId === 'string' && ids.has(personId))) return null;
    const participants = splitAmong as PersonId[];
    const parts = parseParts(item.parts, participants);
    if (parts === null) return null;
    if (occurredOn !== undefined && (typeof occurredOn !== 'string' || !DATE.test(occurredOn))) return null;
    expenses.push({
      id,
      description: description.trim(),
      amountCents,
      paidBy,
      splitAmong: participants,
      ...(parts ? { parts } : {}),
      ...(typeof occurredOn === 'string' ? { occurredOn } : {}),
    });
  }
  return expenses;
}

function parsePayments(value: unknown, ids: Set<string>): Payment[] | null {
  if (!Array.isArray(value)) return null;
  const payments: Payment[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const { id, from, to, amountCents } = item;
    if (typeof id !== 'string' || !id || typeof from !== 'string' || typeof to !== 'string') return null;
    if (!ids.has(from) || !ids.has(to) || from === to) return null;
    if (typeof amountCents !== 'number' || !Number.isSafeInteger(amountCents) || amountCents <= 0) return null;
    payments.push({ id, from, to, amountCents });
  }
  return payments;
}

export function serializeLedger(ledger: Ledger): string {
  return JSON.stringify({
    version: 1,
    groupName: ledger.groupName,
    currency: ledger.currency,
    people: ledger.people,
    expenses: ledger.expenses,
    payments: ledger.payments,
  });
}

export function parseLedgerBackup(raw: string): Ledger | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !isCurrencyCode(parsed.currency)) return null;
    const people = parsePeople(parsed.people);
    if (!people) return null;
    const ids = new Set(people.map((person) => person.id));
    const expenses = parseExpenses(parsed.expenses, ids);
    const payments = parsePayments(parsed.payments, ids);
    if (!expenses || !payments) return null;
    return {
      people,
      expenses,
      payments,
      currency: parsed.currency,
      groupName: typeof parsed.groupName === 'string' ? parsed.groupName.slice(0, 40) : '',
    };
  } catch {
    return null;
  }
}
