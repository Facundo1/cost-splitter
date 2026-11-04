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
          <p className="muted">Split group expenses. Settle up with the fewest transfers.</p>
        </div>
        {hasPeople && (
          <button type="button" className="ghost" onClick={() => setConfirmingReset(true)}>
            Reset
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
        title="Delete everything?"
        message="All people and expenses will be permanently deleted. This action can't be undone."
        confirmLabel="Delete everything"
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
