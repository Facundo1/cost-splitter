export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amountCents: number;
  paidBy: PersonId;
  splitAmong: PersonId[];
}

export interface Transfer {
  from: PersonId;
  to: PersonId;
  amountCents: number;
}
