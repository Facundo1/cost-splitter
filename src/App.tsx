import { useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { PeoplePanel } from './components/PeoplePanel';
import { SettlementPanel } from './components/SettlementPanel';
import { useLedgerStore } from './store/ledgerStore';

export default function App() {
  const hasPeople = useLedgerStore((s) => s.people.length > 0);
  const hasExpenses = useLedgerStore((s) => s.expenses.length > 0);
  const reset = useLedgerStore((s) => s.reset);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>🧾 Split It</h1>
          <p className="muted">Add the people, add what someone paid, and see who should pay whom.</p>
        </div>
        {hasPeople && (
          <button type="button" className="ghost" onClick={() => setConfirmingReset(true)}>
            Start over
          </button>
        )}
      </header>

      <PeoplePanel />
      <ExpenseForm />
      {hasExpenses && (
        <>
          <ExpenseList />
          <SettlementPanel />
        </>
      )}

      <ConfirmDialog
        open={confirmingReset}
        title="Erase everything?"
        message="This removes every person and every bill. You can't undo it."
        confirmLabel="Erase everything"
        onConfirm={() => {
          reset();
          setConfirmingReset(false);
        }}
        onCancel={() => setConfirmingReset(false)}
      />

      <footer className="muted small">
        Data stays in your browser (localStorage). No account, no server.
      </footer>
    </main>
  );
}
