export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  /** Integer cents. Never store money as floats. */
  amountCents: number;
  paidBy: PersonId;
  /** People who share this expense equally. Must be non-empty. */
  splitAmong: PersonId[];
}

export interface Transfer {
  from: PersonId;
  to: PersonId;
  amountCents: number;
}
