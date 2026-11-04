import { useState, type FormEvent } from 'react';
import { todayIso } from '../lib/day';
import { centsToInput, isAmountInput, parseAmountToCents } from '../lib/money';
import type { PersonId } from '../lib/types';
import { useLedgerStore } from '../store/ledgerStore';
import { Card } from './Card';

export function ExpenseForm({ editingId = null, onDone = () => {} }: { editingId?: string | null; onDone?: () => void }) {
  const people = useLedgerStore((s) => s.people);
  const expenses = useLedgerStore((s) => s.expenses);
  const currency = useLedgerStore((s) => s.currency);
  const onAdd = useLedgerStore((s) => s.addExpense);
  const onUpdate = useLedgerStore((s) => s.updateExpense);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<PersonId>('');
  const [excluded, setExcluded] = useState<PersonId[]>([]);
  const [occurredOn, setOccurredOn] = useState(todayIso);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const editing = expenses.find((expense) => expense.id === editingId) ?? null;

  if ((editing?.id ?? null) !== loadedId) {
    setLoadedId(editing?.id ?? null);
    setDescription(editing?.description ?? '');
    setAmount(editing ? centsToInput(editing.amountCents) : '');
    setPaidBy(editing?.paidBy ?? '');
    setExcluded(editing ? people.filter((person) => !editing.splitAmong.includes(person.id)).map((person) => person.id) : []);
    setOccurredOn(editing?.occurredOn ?? todayIso());
  }

  const amountCents = parseAmountToCents(amount);
  const payer = people.find((p) => p.id === paidBy)?.id ?? people[0]?.id;
  const splitAmong = people.map((p) => p.id).filter((id) => !excluded.includes(id));

  const toggle = (id: PersonId) =>
    setExcluded((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const trimmed = description.trim();
  const draft =
    trimmed && amountCents && payer && splitAmong.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(occurredOn)
      ? { description: trimmed, amountCents, paidBy: payer, splitAmong, occurredOn }
      : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (editing) {
      onUpdate(editing.id, draft);
      onDone();
      return;
    }
    onAdd(draft);
    setDescription('');
    setAmount('');
  }

  return (
    <Card title={editing ? 'Change this bill' : 'Add a bill'}>
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
            <span>When?</span>
            <input type="date" value={occurredOn} onChange={(event) => setOccurredOn(event.target.value)} />
          </label>

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

          <div className="row">
            <button type="submit" disabled={!draft}>
              {editing ? 'Save changes' : 'Add this bill'}
            </button>
            {editing && (
              <button type="button" className="ghost" onClick={onDone}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </Card>
  );
}
