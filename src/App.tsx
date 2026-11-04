import { useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { PeoplePanel } from './components/PeoplePanel';
import { SettlementPanel } from './components/SettlementPanel';
import { SESSION_KEY, WelcomeScreen } from './components/WelcomeScreen';
import { CURRENCIES, CURRENCY_NAME, isCurrencyCode } from './lib/currency';
import { sampleDinner } from './lib/sample';
import { useLedgerStore } from './store/ledgerStore';

export default function App() {
  const hasPeople = useLedgerStore((s) => s.people.length > 0);
  const hasExpenses = useLedgerStore((s) => s.expenses.length > 0);
  const currency = useLedgerStore((s) => s.currency);
  const setCurrency = useLedgerStore((s) => s.setCurrency);
  const groupName = useLedgerStore((s) => s.groupName);
  const setGroupName = useLedgerStore((s) => s.setGroupName);
  const load = useLedgerStore((s) => s.load);
  const reset = useLedgerStore((s) => s.reset);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const editingId = useLedgerStore((s) => (s.expenses.some((expense) => expense.id === selectedId) ? selectedId : null));
  const [started, setStarted] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

  const start = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setStarted(true);
  };

  if (!started) {
    return (
      <WelcomeScreen
        onStart={start}
        onSample={() => {
          load(sampleDinner());
          start();
        }}
      />
    );
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>🧾 Split It</h1>
          <label className="field">
            <span className="sr-only">Group name</span>
            <input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Name this group"
              maxLength={40}
              aria-label="Group name"
            />
          </label>
        </div>
        <div className="toolbar">
          <label className="field currency">
            <span>Currency</span>
            <select
              value={currency}
              onChange={(e) => {
                if (isCurrencyCode(e.target.value)) setCurrency(e.target.value);
              }}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_NAME[code]} ({code})
                </option>
              ))}
            </select>
          </label>
          {hasPeople && (
            <button type="button" className="ghost" onClick={() => setConfirmingReset(true)}>
              Start over
            </button>
          )}
        </div>
      </header>

      <PeoplePanel />
      <ExpenseForm editingId={editingId} onDone={() => setSelectedId(null)} />
      {hasExpenses && (
        <>
          <ExpenseList onEdit={setSelectedId} />
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
          setSelectedId(null);
          setConfirmingReset(false);
        }}
        onCancel={() => setConfirmingReset(false)}
      />

      <footer className="muted small">
        Data stays in this browser. No account, no server.
      </footer>
    </main>
  );
}
