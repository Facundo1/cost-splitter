import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isCurrencyCode, type CurrencyCode } from '../lib/currency';
import {
  EMPTY_LEDGER,
  addExpense,
  addPerson,
  updateExpense,
  removeExpense,
  loadLedger,
  removePerson,
  setCurrency,
  setGroupName,
  type Ledger,
} from '../lib/ledger';
import type { Expense, PersonId } from '../lib/types';

interface LedgerActions {
  addPerson: (name: string) => void;
  removePerson: (id: PersonId) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setGroupName: (groupName: string) => void;
  load: (ledger: Ledger) => void;
  reset: () => void;
}

export const STORAGE_KEY = 'split-it:v2';

export const useLedgerStore = create<Ledger & LedgerActions>()(
  persist(
    (set) => ({
      ...EMPTY_LEDGER,
      addPerson: (name) => set((s) => addPerson(s, name)),
      removePerson: (id) => set((s) => removePerson(s, id)),
      addExpense: (expense) => set((s) => addExpense(s, expense)),
      updateExpense: (id, expense) => set((s) => updateExpense(s, id, expense)),
      removeExpense: (id) => set((s) => removeExpense(s, id)),
      setCurrency: (currency) => set((s) => setCurrency(s, currency)),
      setGroupName: (groupName) => set((s) => setGroupName(s, groupName)),
      load: (ledger) => set(loadLedger(ledger)),
      reset: () => set(EMPTY_LEDGER),
    }),
    {
      name: STORAGE_KEY,
      partialize: ({ people, expenses, currency, groupName }) => ({ people, expenses, currency, groupName }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Ledger>;
        return {
          ...current,
          ...saved,
          currency: isCurrencyCode(saved.currency) ? saved.currency : current.currency,
          groupName: typeof saved.groupName === 'string' ? saved.groupName : current.groupName,
        };
      },
    },
  ),
);

export function useNameOf() {
  const people = useLedgerStore((s) => s.people);
  return (id: PersonId) => people.find((p) => p.id === id)?.name ?? '?';
}
