import { useMemo } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { PeoplePanel } from './components/PeoplePanel';
import { SettlementPanel } from './components/SettlementPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { computeBalances, settle } from './lib/settle';
import type { Expense, Person, PersonId } from './lib/types';

// Bump the version if the stored shape changes (cheaper than writing migrations).
const STORAGE_KEY = 'split-it:v1';

interface State {
  people: Person[];
  expenses: Expense[];
}

const EMPTY: State = { people: [], expenses: [] };

export default function App() {
  const [state, setState] = useLocalStorage<State>(STORAGE_KEY, EMPTY);
  const { people, expenses } = state;

  const names = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people]);
  const nameOf = (id: PersonId) => names.get(id) ?? '?';

  const lockedIds = useMemo(
    () => new Set(expenses.flatMap((e) => [e.paidBy, ...e.splitAmong])),
    [expenses],
  );
  const balances = useMemo(() => computeBalances(people, expenses), [people, expenses]);
  const transfers = useMemo(() => settle(balances), [balances]);

  const addPerson = (name: string) =>
    setState((s) => ({ ...s, people: [...s.people, { id: crypto.randomUUID(), name }] }));
  const removePerson = (id: PersonId) =>
    setState((s) => ({ ...s, people: s.people.filter((p) => p.id !== id) }));
  const addExpense = (expense: Omit<Expense, 'id'>) =>
    setState((s) => ({ ...s, expenses: [...s.expenses, { ...expense, id: crypto.randomUUID() }] }));
  const removeExpense = (id: string) =>
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));

  function reset() {
    if (window.confirm('Clear all people and expenses?')) setState(EMPTY);
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>🧾 Split It</h1>
          <p className="muted">Split group expenses. Settle up with the fewest transfers.</p>
        </div>
        {(people.length > 0 || expenses.length > 0) && (
          <button type="button" className="ghost" onClick={reset}>
            Reset
          </button>
        )}
      </header>

      <PeoplePanel people={people} lockedIds={lockedIds} onAdd={addPerson} onRemove={removePerson} />
      <ExpenseForm people={people} onAdd={addExpense} />
      <ExpenseList expenses={expenses} nameOf={nameOf} onRemove={removeExpense} />
      {expenses.length > 0 && (
        <SettlementPanel balances={balances} transfers={transfers} nameOf={nameOf} />
      )}

      <footer className="muted small">
        Data stays in your browser (localStorage). No account, no server.
      </footer>
    </main>
  );
}
