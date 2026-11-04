import { useState, type FormEvent } from 'react';
import { isNameInput, isNameTaken, peopleWithExpenses } from '../lib/ledger';
import { useLedgerStore } from '../store/ledgerStore';
import { Card } from './Card';

export function PeoplePanel() {
  const people = useLedgerStore((s) => s.people);
  const expenses = useLedgerStore((s) => s.expenses);
  const onAdd = useLedgerStore((s) => s.addPerson);
  const onRemove = useLedgerStore((s) => s.removePerson);
  const lockedIds = peopleWithExpenses(expenses);

  const [name, setName] = useState('');
  const isDuplicate = isNameTaken(people, name);
  const canAdd = name.trim() !== '' && !isDuplicate;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(name);
    setName('');
  }

  return (
    <Card title="1. Who's in?">
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
          placeholder="Add a name"
          maxLength={30}
          autoComplete="off"
        />
        <button type="submit" disabled={!canAdd}>
          Add
        </button>
      </form>
      {isDuplicate && <p className="hint">That name is already in the group.</p>}

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
