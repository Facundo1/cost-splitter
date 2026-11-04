import { formatCents } from '../lib/money';
import type { PersonId, Transfer } from '../lib/types';

interface Props {
  balances: Map<PersonId, number>;
  transfers: Transfer[];
  nameOf: (id: PersonId) => string;
}

export function SettlementPanel({ balances, transfers, nameOf }: Props) {
  return (
    <section className="card highlight" aria-labelledby="settle-heading">
      <h2 id="settle-heading">3. Settle up</h2>

      {transfers.length === 0 ? (
        <p className="muted">Everyone is even. 🎉</p>
      ) : (
        <ol className="transfers" aria-label="Transfers">
          {transfers.map((t) => (
            <li key={`${t.from}-${t.to}`}>
              <strong>{nameOf(t.from)}</strong> pays <strong>{nameOf(t.to)}</strong>{' '}
              <span className="money">${formatCents(t.amountCents)}</span>
            </li>
          ))}
        </ol>
      )}

      <details>
        <summary>Balances</summary>
        <ul className="list">
          {[...balances].map(([id, cents]) => (
            <li key={id} className="list-item">
              {nameOf(id)}
              <span className={`money ${cents > 0 ? 'pos' : cents < 0 ? 'neg' : ''}`}>
                {cents > 0 ? '+' : cents < 0 ? '−' : ''}${formatCents(Math.abs(cents))}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
