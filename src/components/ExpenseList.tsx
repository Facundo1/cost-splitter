import { formatCents } from '../lib/money';
import type { Expense, PersonId } from '../lib/types';

interface Props {
  expenses: Expense[];
  nameOf: (id: PersonId) => string;
  onRemove: (id: string) => void;
}

export function ExpenseList({ expenses, nameOf, onRemove }: Props) {
  if (expenses.length === 0) return null;
  const total = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <section className="card" aria-labelledby="expenses-heading">
      <h2 id="expenses-heading">
        Expenses <span className="muted">· total ${formatCents(total)}</span>
      </h2>
      <ul className="list">
        {expenses.map((e) => (
          <li key={e.id} className="list-item">
            <div>
              <strong>{e.description}</strong>
              <div className="muted small">
                {nameOf(e.paidBy)} paid · split {e.splitAmong.length} ways
              </div>
            </div>
            <div className="row tight">
              <span className="money">${formatCents(e.amountCents)}</span>
              <button
                type="button"
                className="ghost"
                onClick={() => onRemove(e.id)}
                aria-label={`Delete ${e.description}`}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
