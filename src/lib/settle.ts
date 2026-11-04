import type { Expense, Person, PersonId, Transfer } from './types';

/**
 * Net balance per person, in cents.
 * Positive = the group owes them money. Negative = they owe the group.
 *
 * Each expense is split evenly. Leftover cents (e.g. 100 / 3) are assigned
 * one by one to the first participants, so balances always sum to exactly 0.
 */
export function computeBalances(people: Person[], expenses: Expense[]): Map<PersonId, number> {
  const balances = new Map<PersonId, number>(people.map((p) => [p.id, 0]));
  const add = (id: PersonId, delta: number) => balances.set(id, (balances.get(id) ?? 0) + delta);

  for (const expense of expenses) {
    const n = expense.splitAmong.length;
    if (n === 0) continue;

    const share = Math.floor(expense.amountCents / n);
    let remainder = expense.amountCents - share * n;

    add(expense.paidBy, expense.amountCents);
    for (const id of expense.splitAmong) {
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      add(id, -(share + extra));
    }
  }

  return balances;
}

/**
 * Turns balances into a list of transfers that settles everyone.
 *
 * Greedy: repeatedly match the biggest debtor with the biggest creditor.
 * Produces at most (n - 1) transfers. Finding the true minimum number of
 * transfers is NP-hard (it reduces to subset-sum); greedy is optimal or
 * near-optimal for the group sizes this app is meant for (a dinner, a trip).
 */
export function settle(balances: Map<PersonId, number>): Transfer[] {
  const creditors: { id: PersonId; amount: number }[] = [];
  const debtors: { id: PersonId; amount: number }[] = [];

  for (const [id, amount] of balances) {
    if (amount > 0) creditors.push({ id, amount });
    else if (amount < 0) debtors.push({ id, amount: -amount });
  }

  const byAmountDesc = (a: { amount: number }, b: { amount: number }) => b.amount - a.amount;
  const transfers: Transfer[] = [];

  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort(byAmountDesc);
    debtors.sort(byAmountDesc);
    const creditor = creditors[0]!;
    const debtor = debtors[0]!;

    const amount = Math.min(creditor.amount, debtor.amount);
    transfers.push({ from: debtor.id, to: creditor.id, amountCents: amount });

    creditor.amount -= amount;
    debtor.amount -= amount;
    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }

  return transfers;
}
