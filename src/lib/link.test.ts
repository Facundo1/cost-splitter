import { describe, expect, it } from 'vitest';
import { EMPTY_LEDGER } from './ledger';
import { encodeGroupParam, ledgerFromSearch } from './link';
import { sampleDinner } from './sample';

describe('group link', () => {
  it('round-trips a group through the query', () => {
    const dinner = sampleDinner();
    const restored = ledgerFromSearch(`?g=${encodeGroupParam(dinner)}`);
    expect(restored).toEqual(dinner);
  });

  it('keeps names that are not ascii', () => {
    const ledger = { ...EMPTY_LEDGER, people: [{ id: 'jose', name: 'José' }] };
    expect(ledgerFromSearch(`g=${encodeGroupParam(ledger)}`)?.people[0]?.name).toBe('José');
  });

  it('rejects a broken value', () => {
    expect(ledgerFromSearch('?g=not-a-group')).toBeNull();
    expect(ledgerFromSearch('')).toBeNull();
  });
});
