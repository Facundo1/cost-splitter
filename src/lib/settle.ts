import type { Expense, Person, PersonId, Transfer } from './types';

function partsOf(expense: Expense, id: PersonId): number {
  const parts = expense.parts?.[id];
  return typeof parts === 'number' && Number.isInteger(parts) && parts > 0 ? parts : 1;
}

function splitExpense(expense: Expense): [PersonId, number][] {
  const weights = expense.splitAmong.map((id) => ({ id, parts: partsOf(expense, id) }));
  const totalParts = weights.reduce((sum, row) => sum + row.parts, 0);
  if (weights.length === 0 || totalParts <= 0) return [];

  const rows = weights.map((row) => {
    const raw = (expense.amountCents * row.parts) / totalParts;
    return { id: row.id, cents: Math.floor(raw), rest: raw - Math.floor(raw) };
  });
  let leftover = expense.amountCents - rows.reduce((sum, row) => sum + row.cents, 0);
  const order = rows
    .map((row, index) => ({ index, rest: row.rest }))
    .sort((left, right) => right.rest - left.rest || left.index - right.index);

  for (let step = 0; leftover > 0 && order.length > 0; step += 1) {
    const next = order[step % order.length];
    const row = next ? rows[next.index] : undefined;
    if (!row) break;
    row.cents += 1;
    leftover -= 1;
  }

  return rows.map((row) => [row.id, row.cents]);
}

export function computeShares(people: Person[], expenses: Expense[]): Map<PersonId, number> {
  const shares = new Map<PersonId, number>(people.map((p) => [p.id, 0]));
  for (const expense of expenses) {
    for (const [id, cents] of splitExpense(expense)) shares.set(id, (shares.get(id) ?? 0) + cents);
  }
  return shares;
}

export function computeBalances(people: Person[], expenses: Expense[]): Map<PersonId, number> {
  const balances = new Map<PersonId, number>(people.map((p) => [p.id, 0]));
  const add = (id: PersonId, delta: number) => balances.set(id, (balances.get(id) ?? 0) + delta);

  for (const expense of expenses) {
    add(expense.paidBy, expense.amountCents);
    for (const [id, cents] of splitExpense(expense)) add(id, -cents);
  }
  return balances;
}

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
