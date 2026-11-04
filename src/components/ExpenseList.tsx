import { totalCents } from '../lib/ledger';
import { formatCents } from '../lib/money';
import { useLedgerStore, useNameOf } from '../store/ledgerStore';
import { Card } from './Card';

export function ExpenseList() {
  const expenses = useLedgerStore((s) => s.expenses);
  const currency = useLedgerStore((s) => s.currency);
  const onRemove = useLedgerStore((s) => s.removeExpense);
  const nameOf = useNameOf();

  return (
    <Card
      title={
        <>
          Bills <span className="muted">· {formatCents(totalCents(expenses), currency)} in total</span>
        </>
      }
    >
      <ul className="list">
        {expenses.map((e) => (
          <li key={e.id} className="list-item">
            <div>
              <strong>{e.description}</strong>
              <div className="muted small">
                {nameOf(e.paidBy)} paid · shared by {e.splitAmong.length} {e.splitAmong.length === 1 ? 'person' : 'people'}
              </div>
            </div>
            <div className="row tight">
              <span className="money">{formatCents(e.amountCents, currency)}</span>
              <button
                type="button"
                className="ghost remove"
                onClick={() => onRemove(e.id)}
                aria-label={`Delete ${e.description}`}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
