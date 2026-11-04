import { describe, expect, it } from 'vitest';
import {
  EMPTY_LEDGER,
  addExpense,
  addPayment,
  addPerson,
  isNameInput,
  isNameTaken,
  peopleWithExpenses,
  removeExpense,
  removePerson,
  setCurrency,
  updateExpense,
  setGroupName,
  totalCents,
  type Ledger,
} from './ledger';

const withPeople = (...names: string[]) => names.reduce(addPerson, EMPTY_LEDGER);
const idOf = (ledger: Ledger, name: string) => ledger.people.find((p) => p.name === name)!.id;

describe('setGroupName', () => {
  it('stores the name the user is still typing', () => {
    expect(setGroupName(EMPTY_LEDGER, 'Trip ').groupName).toBe('Trip ');
    expect(setGroupName(EMPTY_LEDGER, '')).toBe(EMPTY_LEDGER);
  });
});

describe('setCurrency', () => {
  it('keeps people and bills and ignores the same currency', () => {
    const ledger = withPeople('Ana');
    expect(setCurrency(ledger, 'EUR').currency).toBe('EUR');
    expect(setCurrency(ledger, 'EUR').people).toEqual(ledger.people);
    expect(setCurrency(ledger, 'USD')).toBe(ledger);
  });
});

describe('addPerson', () => {
  it('adds a trimmed name with a unique id', () => {
    const ledger = withPeople('  Ana ', 'Beto');
    expect(ledger.people.map((p) => p.name)).toEqual(['Ana', 'Beto']);
    expect(new Set(ledger.people.map((p) => p.id)).size).toBe(2);
  });

  it.each(['', '   ', 'ana', ' ANA '])('ignores blank or duplicate name %j', (name) => {
    const ledger = withPeople('Ana');
    expect(addPerson(ledger, name)).toBe(ledger);
  });

  it('does not mutate the previous ledger', () => {
    const before = withPeople('Ana');
    addPerson(before, 'Beto');
    expect(before.people).toHaveLength(1);
  });
});

describe('isNameTaken', () => {
  it('compares case-insensitively and ignores surrounding spaces', () => {
    const { people } = withPeople('Ana');
    expect(isNameTaken(people, ' aNa ')).toBe(true);
    expect(isNameTaken(people, 'Beto')).toBe(false);
  });
});

describe('removePerson', () => {
  it('removes a person without expenses', () => {
    const ledger = withPeople('Ana', 'Beto');
    expect(removePerson(ledger, idOf(ledger, 'Ana')).people.map((p) => p.name)).toEqual(['Beto']);
  });

  it('refuses to remove someone who paid or shares an expense', () => {
    let ledger = withPeople('Ana', 'Beto', 'Caro');
    const [ana, beto, caro] = ['Ana', 'Beto', 'Caro'].map((n) => idOf(ledger, n));
    ledger = addExpense(ledger, {
      description: 'Pizza',
      amountCents: 1000,
      paidBy: ana!,
      splitAmong: [beto!],
    });

    expect(removePerson(ledger, ana!)).toBe(ledger);
    expect(removePerson(ledger, beto!)).toBe(ledger);
    expect(removePerson(ledger, caro!).people).toHaveLength(2);
  });
});

describe('expenses', () => {
  it('adds and removes expenses by id', () => {
    let ledger = withPeople('Ana', 'Beto');
    const ana = idOf(ledger, 'Ana');
    ledger = addExpense(ledger, { description: 'Taxi', amountCents: 500, paidBy: ana, splitAmong: [ana] });

    const [expense] = ledger.expenses;
    expect(expense).toMatchObject({ description: 'Taxi', amountCents: 500 });
    expect(removeExpense(ledger, expense!.id).expenses).toEqual([]);
  });

  it('updates one bill and leaves the others', () => {
    let ledger = withPeople('Ana', 'Beto');
    const ana = idOf(ledger, 'Ana');
    ledger = addExpense(ledger, { description: 'Taxi', amountCents: 500, paidBy: ana, splitAmong: [ana] });
    const id = ledger.expenses[0]!.id;
    const next = updateExpense(ledger, id, {
      description: 'Taxi home',
      amountCents: 800,
      paidBy: ana,
      splitAmong: [ana],
      occurredOn: '2026-11-04',
    });
    expect(next.expenses[0]).toMatchObject({ id, description: 'Taxi home', amountCents: 800, occurredOn: '2026-11-04' });
    expect(updateExpense(ledger, 'missing', { description: 'x', amountCents: 1, paidBy: ana, splitAmong: [ana] })).toBe(ledger);
  });

  it('peopleWithExpenses includes payers and participants', () => {
    const ids = peopleWithExpenses([
      { id: '1', description: 'x', amountCents: 1, paidBy: 'a', splitAmong: ['b', 'c'] },
    ]);
    expect([...ids].sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('addPayment', () => {
  it('ignores a payment from someone to themself', () => {
    const ledger = withPeople('Ana');
    const ana = idOf(ledger, 'Ana');
    expect(addPayment(ledger, { from: ana, to: ana, amountCents: 100 })).toBe(ledger);
  });
});

describe('totalCents', () => {
  it('sums every expense', () => {
    const expense = (amountCents: number) => ({ id: '', description: '', amountCents, paidBy: 'a', splitAmong: ['a'] });
    expect(totalCents([])).toBe(0);
    expect(totalCents([expense(1050), expense(1)])).toBe(1051);
  });
});

describe('isNameInput', () => {
  it.each(['', 'Ana', 'José María', "O'Brien", 'J.R.', 'Ana-Lía', 'Zoë'])('accepts %j', (input) => {
    expect(isNameInput(input)).toBe(true);
  });

  it.each(['Ana2', '123', 'ana@', 'a_b'])('rejects %j', (input) => {
    expect(isNameInput(input)).toBe(false);
  });
});
