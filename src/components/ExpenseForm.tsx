import { useState, type FormEvent } from 'react';
import { isAmountInput, parseAmountToCents } from '../lib/money';
import type { PersonId } from '../lib/types';
import { useLedgerStore } from '../store/ledgerStore';
import { Card } from './Card';

export function ExpenseForm() {
  const people = useLedgerStore((s) => s.people);
  const currency = useLedgerStore((s) => s.currency);
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
    <Card title="Add a bill">
      {people.length < 2 ? (
        <p className="muted">Add at least two people, then you can add a bill.</p>
      ) : (
        <form onSubmit={handleSubmit} className="stack">
          <div className="row">
            <label className="field grow">
              <span>What was it for?</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dinner, taxi, hotel"
                maxLength={60}
              />
            </label>
            <div className="field amount">
              <div className="label-line">
                <label htmlFor="bill-amount">Amount</label>
                <span className="muted">{currency}</span>
              </div>
              <input
                id="bill-amount"
                value={amount}
                onChange={(e) => {
                  if (isAmountInput(e.target.value)) setAmount(e.target.value);
                }}
                placeholder="0.00"
                inputMode="decimal"
                aria-invalid={amount !== '' && amountCents === null}
              />
            </div>
          </div>

          <label className="field">
            <span>Who paid?</span>
            <select value={payer} onChange={(e) => setPaidBy(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="field">
            <legend>Who shares this bill?</legend>
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
            Add this bill
          </button>
        </form>
      )}
    </Card>
  );
}
