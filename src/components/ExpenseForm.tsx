import { useState, type FormEvent } from 'react';
import { parseAmountToCents } from '../lib/money';
import type { Expense, Person, PersonId } from '../lib/types';

interface Props {
  people: Person[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

export function ExpenseForm({ people, onAdd }: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<PersonId>('');
  // Track who is *excluded* so new people are included by default without syncing state.
  const [excluded, setExcluded] = useState<Set<PersonId>>(new Set());

  const amountCents = parseAmountToCents(amount);
  const payer = people.some((p) => p.id === paidBy) ? paidBy : people[0]?.id;
  const splitAmong = people.filter((p) => !excluded.has(p.id)).map((p) => p.id);
  const canSubmit = Boolean(description.trim() && amountCents && payer && splitAmong.length > 0);

  function toggle(id: PersonId) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || !amountCents || !payer) return;
    onAdd({ description: description.trim(), amountCents, paidBy: payer, splitAmong });
    setDescription('');
    setAmount('');
  }

  if (people.length < 2) {
    return (
      <section className="card" aria-labelledby="expense-heading">
        <h2 id="expense-heading">2. Add an expense</h2>
        <p className="muted">Add at least two people to start splitting.</p>
      </section>
    );
  }

  return (
    <section className="card" aria-labelledby="expense-heading">
      <h2 id="expense-heading">2. Add an expense</h2>
      <form onSubmit={handleSubmit} className="stack">
        <div className="row">
          <label className="field grow">
            <span>What for</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Asado, nafta, Airbnb…"
              maxLength={60}
            />
          </label>
          <label className="field amount">
            <span>Amount</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              aria-invalid={amount !== '' && amountCents === null}
            />
          </label>
        </div>

        <label className="field">
          <span>Paid by</span>
          <select value={payer} onChange={(e) => setPaidBy(e.target.value)}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="field">
          <legend>Split between</legend>
          <div className="checks">
            {people.map((p) => (
              <label key={p.id} className="check">
                <input
                  type="checkbox"
                  checked={!excluded.has(p.id)}
                  onChange={() => toggle(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={!canSubmit}>
          Add expense
        </button>
      </form>
    </section>
  );
}
