import type { Expense, Person, PersonId, Transfer } from './types';

/** Splits an expense evenly. Leftover cents (100 / 3) go to the first participants. */
function splitExpense({ amountCents, splitAmong }: Expense): [PersonId, number][] {
  const share = Math.floor(amountCents / splitAmong.length);
  const remainder = amountCents % splitAmong.length;
  return splitAmong.map((id, i) => [id, share + (i < remainder ? 1 : 0)]);
}

/** How much of the total each person consumed, in cents (what they "spent"). */
export function computeShares(people: Person[], expenses: Expense[]): Map<PersonId, number> {
  const shares = new Map<PersonId, number>(people.map((p) => [p.id, 0]));
  for (const expense of expenses) {
    for (const [id, cents] of splitExpense(expense)) shares.set(id, (shares.get(id) ?? 0) + cents);
  }
  return shares;
}

/** Net balance per person in cents: what they paid minus their share. Always sums to 0. */
export function computeBalances(people: Person[], expenses: Expense[]): Map<PersonId, number> {
  const balances = new Map<PersonId, number>(people.map((p) => [p.id, 0]));
  const add = (id: PersonId, delta: number) => balances.set(id, (balances.get(id) ?? 0) + delta);

  for (const expense of expenses) {
    add(expense.paidBy, expense.amountCents);
    for (const [id, cents] of splitExpense(expense)) add(id, -cents);
  }
  return balances;
}

/**
 * Greedy settlement: the biggest debtor pays the biggest creditor until everyone is even.
 * At most n - 1 transfers. Not always the minimum (that's NP-hard) — see settle.test.ts.
 */
export function settle(balances: Map<PersonId, number>): Transfer[] {
  const people = [...balances].map(([id, amount]) => ({ id, amount }));
  const transfers: Transfer[] = [];

  for (;;) {
    people.sort((a, b) => a.amount - b.amount);
    const debtor = people[0];
    const creditor = people.at(-1);
    if (!debtor || !creditor || debtor.amount >= 0) return transfers;

    const amount = Math.min(-debtor.amount, creditor.amount);
    transfers.push({ from: debtor.id, to: creditor.id, amountCents: amount });
    debtor.amount += amount;
    creditor.amount -= amount;
  }
}
