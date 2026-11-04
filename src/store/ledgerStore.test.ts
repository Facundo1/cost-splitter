import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, useLedgerStore } from './ledgerStore';

const store = () => useLedgerStore.getState();

describe('ledgerStore', () => {
  it('delegates actions to the ledger rules', () => {
    store().addPerson('Ana');
    store().addPerson('ana');
    store().addPerson('Beto');
    const [ana, beto] = store().people;

    store().addExpense({ description: 'Pizza', amountCents: 1000, paidBy: ana!.id, splitAmong: [beto!.id] });
    store().removePerson(ana!.id);

    expect(store().people.map((p) => p.name)).toEqual(['Ana', 'Beto']);
    store().removeExpense(store().expenses[0]!.id);
    expect(store().expenses).toEqual([]);
  });

  it('reset clears people and expenses', () => {
    store().addPerson('Ana');
    store().reset();
    expect(store().people).toEqual([]);
  });

  it('persists only the data (not the actions) to localStorage', () => {
    store().addPerson('Ana');
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(Object.keys(saved.state).sort()).toEqual(['expenses', 'people']);
    expect(saved.state.people[0].name).toBe('Ana');
  });

  it('restores saved data on load', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { people: [{ id: 'x', name: 'Caro' }], expenses: [] }, version: 0 }),
    );
    await useLedgerStore.persist.rehydrate();
    expect(store().people).toEqual([{ id: 'x', name: 'Caro' }]);
  });

  it('starts empty when saved data is corrupt instead of crashing', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    await useLedgerStore.persist.rehydrate();
    expect(store().people).toEqual([]);
  });
});
