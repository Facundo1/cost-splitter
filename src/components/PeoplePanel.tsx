import { useState, type FormEvent } from 'react';
import { isNameInput, isNameTaken, peopleWithExpenses } from '../lib/ledger';
import { sampleDinner } from '../lib/sample';
import { useLedgerStore } from '../store/ledgerStore';
import { Card } from './Card';
import { ConfirmDialog } from './ConfirmDialog';

export function PeoplePanel() {
  const people = useLedgerStore((s) => s.people);
  const expenses = useLedgerStore((s) => s.expenses);
  const onAdd = useLedgerStore((s) => s.addPerson);
  const onRemove = useLedgerStore((s) => s.removePerson);
  const load = useLedgerStore((s) => s.load);
  const lockedIds = peopleWithExpenses(expenses);

  const [name, setName] = useState('');
  const [confirmingSample, setConfirmingSample] = useState(false);
  const isDuplicate = isNameTaken(people, name);
  const canAdd = name.trim() !== '' && !isDuplicate;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(name);
    setName('');
  }

  return (
    <Card title="People">
      <form onSubmit={handleSubmit} className="row">
        <label className="sr-only" htmlFor="person-name">
          Name
        </label>
        <input
          id="person-name"
          value={name}
          onChange={(e) => {
            if (isNameInput(e.target.value)) setName(e.target.value);
          }}
          placeholder="Type a name"
          maxLength={30}
          autoComplete="off"
        />
        <button type="submit" disabled={!canAdd}>
          Add
        </button>
      </form>
      {isDuplicate && <p className="hint">That name is already here.</p>}
      {people.length === 0 && <p className="muted small">Add everyone who shared the cost.</p>}
      <button
        type="button"
        className="ghost"
        onClick={() => {
          if (people.length > 0 || expenses.length > 0) setConfirmingSample(true);
          else load(sampleDinner());
        }}
      >
        Use a sample dinner
      </button>
      <ConfirmDialog
        open={confirmingSample}
        title="Replace this group?"
        message="The sample dinner replaces the people and bills you added."
        confirmLabel="Use the sample"
        onConfirm={() => {
          load(sampleDinner());
          setConfirmingSample(false);
        }}
        onCancel={() => setConfirmingSample(false)}
      />

      {people.length > 0 && (
        <ul className="chips">
          {people.map((p) => (
            <li key={p.id} className="chip">
              {p.name}
              <button
                type="button"
                className="chip-remove remove"
                onClick={() => onRemove(p.id)}
                disabled={lockedIds.has(p.id)}
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
