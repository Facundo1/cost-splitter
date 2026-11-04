import { describe, expect, it } from 'vitest';
import { sampleDinner } from './sample';
import { computeBalances, settle } from './settle';

describe('sampleDinner', () => {
  it('is a named dinner whose balances settle to zero', () => {
    const ledger = sampleDinner();
    const balances = computeBalances(ledger.people, ledger.expenses);
    expect(ledger.groupName).toBe('Saturday dinner');
    expect([...balances.values()].reduce((sum, cents) => sum + cents, 0)).toBe(0);
    expect(settle(balances).length).toBeGreaterThan(0);
  });
});