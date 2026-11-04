import { useState, type FormEvent } from 'react';
import type { Person, PersonId } from '../lib/types';

interface Props {
  people: Person[];
  /** People referenced by at least one expense can't be removed. */
  lockedIds: Set<PersonId>;
  onAdd: (name: string) => void;
  onRemove: (id: PersonId) => void;
}

export function PeoplePanel({ people, lockedIds, onAdd, onRemove }: Props) {
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const isDuplicate = people.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || isDuplicate) return;
    onAdd(trimmed);
    setName('');
  }

  return (
    <section className="card" aria-labelledby="people-heading">
      <h2 id="people-heading">1. Who's in?</h2>
      <form onSubmit={handleSubmit} className="row">
        <label className="sr-only" htmlFor="person-name">
          Name
        </label>
        <input
          id="person-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a name"
          maxLength={30}
          autoComplete="off"
        />
        <button type="submit" disabled={!trimmed || isDuplicate}>
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
                className="chip-remove"
                onClick={() => onRemove(p.id)}
                disabled={lockedIds.has(p.id)}
                aria-label={`Remove ${p.name}`}
                title={lockedIds.has(p.id) ? 'Has expenses — remove those first' : 'Remove'}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
