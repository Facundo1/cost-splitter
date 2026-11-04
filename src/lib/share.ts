import type { Expense, PersonId } from './types';
import { computeBalances, computeShares, settle } from './settle';

import type { Ledger } from './ledger';
import { totalCents } from './ledger';
import { formatCents } from './money';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function settlementMessage({ people, expenses, currency = 'USD', groupName = '' }: Ledger): string {
  const money = (cents: number) => formatCents(cents, currency);
  const nameOf = (id: PersonId) => people.find((p) => p.id === id)?.name ?? '?';
  const total = totalCents(expenses);
  const shares = [...computeShares(people, expenses)];
  const transfers = settle(computeBalances(people, expenses));

  const splitLabel = (e: Expense) =>
    e.splitAmong.length === people.length
      ? 'split between everyone'
      : `split between ${e.splitAmong.map(nameOf).join(', ')}`;

  const lines = [
    groupName.trim() ? `🧾 *${groupName.trim()}* (${currency})` : `🧾 *Split It — here’s the bill!* (${currency})`,
    '',
    `*What we spent* (${plural(expenses.length, 'expense')})`,
    ...expenses.map(
      (e) => `• ${e.description}: ${money(e.amountCents)} — paid by ${nameOf(e.paidBy)}, ${splitLabel(e)}`,
    ),
    '',
    `💰 *Total:* ${money(total)}`,
    '',
    '👥 *What each person spent*',
    ...shares.map(([id, cents]) => `• ${nameOf(id)}: ${money(cents)}`),
    '',
  ];

  if (transfers.length === 0) {
    lines.push('✅ *Everyone’s even* — nothing to transfer!');
  } else {
    lines.push(
      `💸 *To settle up* (${plural(transfers.length, 'transfer')})`,
      ...transfers.map((t) => `• ${nameOf(t.from)} → ${nameOf(t.to)}: *${money(t.amountCents)}*`),
    );
  }

  const topPayer = topPayerOf(expenses);
  if (topPayer) {
    lines.push('', `🙌 Thanks ${nameOf(topPayer.id)} for covering the most (${money(topPayer.cents)})!`);
  }
  lines.push('', '_Sent from Split It_');
  return lines.join('\n');
}

function topPayerOf(expenses: Expense[]): { id: PersonId; cents: number } | undefined {
  const paid = new Map<PersonId, number>();
  for (const e of expenses) paid.set(e.paidBy, (paid.get(e.paidBy) ?? 0) + e.amountCents);
  const [id, cents] = [...paid].sort((a, b) => b[1] - a[1])[0] ?? [];
  return id === undefined || cents === undefined ? undefined : { id, cents };
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
