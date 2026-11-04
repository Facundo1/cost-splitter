import { describe, expect, it } from 'vitest';
import type { Ledger } from './ledger';
import { settlementMessage, whatsappShareUrl } from './share';
import type { Expense } from './types';

const people = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Beto' },
  { id: 'c', name: 'Caro' },
];
const expense = (id: string, description: string, amountCents: number, paidBy: string, splitAmong = ['a', 'b', 'c']): Expense => ({
  id,
  description,
  amountCents,
  paidBy,
  splitAmong,
});
const money = (amount: string) => amount.replace('.', '[.,]').replace('$', '\\$');

describe('settlementMessage', () => {
  const ledger: Ledger = {
    people,
    currency: 'USD',
    groupName: '',
    payments: [],
    expenses: [expense('1', 'Dinner', 3000, 'a'), expense('2', 'Drinks', 1000, 'b', ['a', 'b'])],
  };
  const message = settlementMessage(ledger);

  it('lists every expense with amount, payer and who it was split between', () => {
    expect(message).toMatch(new RegExp(`• Dinner: ${money('$30.00')} — paid by Ana, split between everyone`));
    expect(message).toMatch(new RegExp(`• Drinks: ${money('$10.00')} — paid by Beto, split between Ana, Beto`));
    expect(message).toContain('(2 expenses)');
    expect(settlementMessage({ ...ledger, groupName: 'Saturday dinner' })).toContain('*Saturday dinner* (USD)');
  });

  it('shows the total and what each person spent, without an average', () => {
    expect(message).toMatch(new RegExp(`Total:\\* ${money('$40.00')}`));
    expect(message).toContain('What each person spent');
    expect(message).toMatch(new RegExp(`• Ana: ${money('$15.00')}`));
    expect(message).toMatch(new RegExp(`• Caro: ${money('$10.00')}`));
    expect(message).not.toMatch(/average/i);
  });

  it('lists the transfers and thanks the top payer', () => {
    expect(message).toContain('To settle up* (2 transfers)');
    expect(message).toMatch(new RegExp(`• Caro → Ana: \\*${money('$10.00')}\\*`));
    expect(message).toMatch(new RegExp(`Thanks Ana for covering the most \\(${money('$30.00')}\\)`));
  });

  it('uses singular forms and still lists what each person spent', () => {
    const even = settlementMessage({
      people: people.slice(0, 2),
      expenses: [expense('1', 'Pizza', 1000, 'a', ['a', 'b'])],
      currency: 'USD',
      groupName: '',
      payments: [],
    });
    expect(even).toMatch(new RegExp(`• Beto: ${money('$5.00')}`));
    expect(even).toContain('(1 expense)');
    expect(even).toContain('(1 transfer)');
  });

  it('says everyone is even when nothing needs to be transferred', () => {
    const settled = settlementMessage({
      people: people.slice(0, 2),
      expenses: [expense('1', 'Taxi', 1000, 'a', ['a', 'b']), expense('2', 'Bus', 1000, 'b', ['a', 'b'])],
      currency: 'USD',
      groupName: '',
      payments: [],
    });
    expect(settled).toContain('Everyone’s even');
    expect(settled).not.toContain('To settle up');
  });
});

describe('whatsappShareUrl', () => {
  it('encodes the text so line breaks, emoji and symbols survive', () => {
    const text = 'Hi & bye\n💸 *$10*';
    const url = new URL(whatsappShareUrl(text));
    expect(url.origin).toBe('https://wa.me');
    expect(url.searchParams.get('text')).toBe(text);
  });
});
