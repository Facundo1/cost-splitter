import { useState, type FormEvent } from 'react';
import { isAmountInput, parseAmountToCents } from '../lib/money';
import type { PersonId } from '../lib/types';
import { useLedgerStore } from '../store/ledgerStore';
import { Card } from './Card';

export function ExpenseForm() {
  const people = useLedgerStore((s) => s.people);
  const onAdd = useLedgerStore((s) => s.addExpense);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<PersonId>('');
  const [excluded, setExcluded] = useState<PersonId[]>([]);

  const amountCents = parseAmountToCents(amount);
  const payer = people.find((p) => p.id === paidBy)?.id ?? people[0]?.id;
  const splitAmong = people.map((p) => p.id).filter((id) => !excluded.includes(id));

  const toggle = (id: PersonId) =>
    setExcluded((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const trimmed = description.trim();
  const draft =
    trimmed && amountCents && payer && splitAmong.length > 0
      ? { description: trimmed, amountCents, paidBy: payer, splitAmong }
      : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    onAdd(draft);
    setDescription('');
    setAmount('');
  }

  return (
    <Card title="2. Add an expense">
      {people.length < 2 ? (
        <p className="muted">Add at least two people to start splitting.</p>
      ) : (
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
                onChange={(e) => {
                  if (isAmountInput(e.target.value)) setAmount(e.target.value);
                }}
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
                    checked={!excluded.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={!draft}>
            Add expense
          </button>
        </form>
      )}
    </Card>
  );
}
