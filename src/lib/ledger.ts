import type { CurrencyCode } from './currency';
import type { Expense, Person, PersonId } from './types';

export interface Ledger {
  people: Person[];
  expenses: Expense[];
  currency: CurrencyCode;
  groupName: string;
}

export const EMPTY_LEDGER: Ledger = { people: [], expenses: [], currency: 'USD', groupName: '' };

export function setCurrency(ledger: Ledger, currency: CurrencyCode): Ledger {
  return ledger.currency === currency ? ledger : { ...ledger, currency };
}

export function setGroupName(ledger: Ledger, groupName: string): Ledger {
  return ledger.groupName === groupName ? ledger : { ...ledger, groupName };
}

export function loadLedger(ledger: Ledger): Ledger {
  return {
    people: ledger.people,
    expenses: ledger.expenses,
    currency: ledger.currency,
    groupName: ledger.groupName,
  };
}

export function isNameTaken(people: Person[], name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return people.some((p) => p.name.toLowerCase() === normalized);
}

export function totalCents(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amountCents, 0);
}

export function isNameInput(input: string): boolean {
  return /^[\p{L}\p{M} '.-]*$/u.test(input);
}

export function peopleWithExpenses(expenses: Expense[]): Set<PersonId> {
  return new Set(expenses.flatMap((e) => [e.paidBy, ...e.splitAmong]));
}

export function addPerson(ledger: Ledger, name: string): Ledger {
  const trimmed = name.trim();
  if (!trimmed || isNameTaken(ledger.people, trimmed)) return ledger;
  return { ...ledger, people: [...ledger.people, { id: crypto.randomUUID(), name: trimmed }] };
}

export function removePerson(ledger: Ledger, id: PersonId): Ledger {
  if (peopleWithExpenses(ledger.expenses).has(id)) return ledger;
  return { ...ledger, people: ledger.people.filter((p) => p.id !== id) };
}

export function addExpense(ledger: Ledger, expense: Omit<Expense, 'id'>): Ledger {
  return { ...ledger, expenses: [...ledger.expenses, { ...expense, id: crypto.randomUUID() }] };
}

export function removeExpense(ledger: Ledger, id: string): Ledger {
  return { ...ledger, expenses: ledger.expenses.filter((e) => e.id !== id) };
}
