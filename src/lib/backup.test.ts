import { describe, expect, it } from 'vitest';
import { parseLedgerBackup, serializeLedger } from './backup';
import { sampleDinner } from './sample';

describe('ledger backup', () => {
  it('round-trips a group and rejects a file that is not one', () => {
    const ledger = sampleDinner();
    expect(parseLedgerBackup(serializeLedger(ledger))).toEqual(ledger);
    expect(parseLedgerBackup('not json')).toBeNull();
    expect(parseLedgerBackup(JSON.stringify({ currency: 'USD', people: [{ id: 'a', name: 'Ana' }], expenses: [], payments: [] }))).toEqual({
      currency: 'USD',
      groupName: '',
      people: [{ id: 'a', name: 'Ana' }],
      expenses: [],
      payments: [],
    });
    expect(parseLedgerBackup(JSON.stringify({ currency: 'BTC', people: [], expenses: [], payments: [] }))).toBeNull();
    expect(
      parseLedgerBackup(
        JSON.stringify({
          currency: 'EUR',
          people: [{ id: 'a', name: 'Ana' }],
          expenses: [{ id: 'e', description: 'Taxi', amountCents: 100, paidBy: 'missing', splitAmong: ['a'] }],
          payments: [],
        }),
      ),
    ).toBeNull();
  });
});
