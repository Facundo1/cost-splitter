import type { Ledger } from './ledger';

export function sampleDinner(): Ledger {
  return {
    groupName: 'Saturday dinner',
    currency: 'USD',
    people: [
      { id: 'ana', name: 'Ana' },
      { id: 'beto', name: 'Beto' },
      { id: 'caro', name: 'Caro' },
    ],
    expenses: [
      {
        id: 'pizza',
        description: 'Pizza',
        amountCents: 3000,
        paidBy: 'ana',
        splitAmong: ['ana', 'beto', 'caro'],
      },
      {
        id: 'taxi',
        description: 'Taxi',
        amountCents: 1800,
        paidBy: 'beto',
        splitAmong: ['ana', 'beto'],
      },
    ],
  };
}
