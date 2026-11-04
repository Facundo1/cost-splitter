import { describe, expect, it } from 'vitest';
import { computeBalances, computeShares, settle } from './settle';
import type { Expense, Person } from './types';

const people: Person[] = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Beto' },
  { id: 'c', name: 'Caro' },
];
const all = people.map((p) => p.id);

const expense = (paidBy: string, amountCents: number, splitAmong = all): Expense => ({
  id: crypto.randomUUID(),
  description: 'test',
  amountCents,
  paidBy,
  splitAmong,
});

const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);

describe('computeBalances', () => {
  it('starts everyone at zero', () => {
    expect(Object.fromEntries(computeBalances(people, []))).toEqual({ a: 0, b: 0, c: 0 });
  });

  it('splits an expense evenly', () => {
    const balances = computeBalances(people, [expense('a', 3000)]);
    expect(Object.fromEntries(balances)).toEqual({ a: 2000, b: -1000, c: -1000 });
  });

  it('distributes leftover cents so balances always sum to zero', () => {
    const balances = computeBalances(people, [expense('a', 100)]);
    expect(sum(balances)).toBe(0);
    expect(Object.fromEntries(balances)).toEqual({ a: 66, b: -33, c: -33 });
  });

  it('only charges the people the expense was split among', () => {
    const balances = computeBalances(people, [expense('a', 2000, ['a', 'b'])]);
    expect(Object.fromEntries(balances)).toEqual({ a: 1000, b: -1000, c: 0 });
  });
});

describe('computeShares', () => {
  it('gives each participant an equal share, regardless of who paid', () => {
    const shares = computeShares(people, [expense('a', 3000), expense('b', 1000, ['a', 'b'])]);
    expect(Object.fromEntries(shares)).toEqual({ a: 1500, b: 1500, c: 1000 });
  });

  it('shares add up to the total spent, even with leftover cents', () => {
    const shares = computeShares(people, [expense('a', 100), expense('c', 1001, ['a', 'b'])]);
    expect(sum(shares)).toBe(1101);
  });
});

describe('settle', () => {
  it('returns no transfers when everyone is even', () => {
    expect(settle(computeBalances(people, []))).toEqual([]);
  });

  it('settles a simple case', () => {
    const transfers = settle(computeBalances(people, [expense('a', 3000)]));
    expect(transfers).toHaveLength(2);
    expect(transfers).toEqual(
      expect.arrayContaining([
        { from: 'b', to: 'a', amountCents: 1000 },
        { from: 'c', to: 'a', amountCents: 1000 },
      ]),
    );
  });

  it('nets out debts that cancel each other', () => {
    // a pays for b, b pays the same for a -> nobody owes anything
    const transfers = settle(
      computeBalances(people, [expense('a', 1000, ['b']), expense('b', 1000, ['a'])]),
    );
    expect(transfers).toEqual([]);
  });

  it('uses at most n - 1 transfers and fully settles every balance', () => {
    const expenses = [
      expense('a', 12345),
      expense('b', 6789, ['b', 'c']),
      expense('c', 999, ['a']),
      expense('a', 101),
    ];
    const balances = computeBalances(people, expenses);
    const transfers = settle(balances);

    expect(transfers.length).toBeLessThanOrEqual(people.length - 1);

    const after = new Map(balances);
    for (const t of transfers) {
      expect(t.amountCents).toBeGreaterThan(0);
      after.set(t.from, after.get(t.from)! + t.amountCents);
      after.set(t.to, after.get(t.to)! - t.amountCents);
    }
    expect([...after.values()].every((v) => v === 0)).toBe(true);
  });

  it('known limitation: greedy is not always minimal', () => {
    // Optimal is 4 transfers: {+6,-5,-1} and {+4,+3,-7} cancel out independently.
    // Greedy pairs 7 with 6 first and needs 5. Acceptable trade-off — see DECISIONS.md.
    const balances = new Map(
      Object.entries({ a: 600, b: 400, c: 300, d: -700, e: -500, f: -100 }),
    );
    expect(settle(balances)).toHaveLength(5);
  });
});
