import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  EMPTY_LEDGER,
  addExpense,
  addPerson,
  removeExpense,
  removePerson,
  type Ledger,
} from '../lib/ledger';
import type { Expense, PersonId } from '../lib/types';

interface LedgerActions {
  addPerson: (name: string) => void;
  removePerson: (id: PersonId) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  reset: () => void;
}

// Bump the version when the stored shape changes (instead of writing migrations).
export const STORAGE_KEY = 'split-it:v2';

/**
 * Global app state. Thin wrapper: every action delegates to a pure function in lib/ledger.ts,
 * where the business rules (and their unit tests) live. `persist` saves it to localStorage.
 */
export const useLedgerStore = create<Ledger & LedgerActions>()(
  persist(
    (set) => ({
      ...EMPTY_LEDGER,
      addPerson: (name) => set((s) => addPerson(s, name)),
      removePerson: (id) => set((s) => removePerson(s, id)),
      addExpense: (expense) => set((s) => addExpense(s, expense)),
      removeExpense: (id) => set((s) => removeExpense(s, id)),
      reset: () => set(EMPTY_LEDGER),
    }),
    {
      name: STORAGE_KEY,
      partialize: ({ people, expenses }) => ({ people, expenses }),
    },
  ),
);

export function useNameOf() {
  const people = useLedgerStore((s) => s.people);
  return (id: PersonId) => people.find((p) => p.id === id)?.name ?? '?';
}
