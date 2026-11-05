import { useEffect, useLayoutEffect, useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GroupFile } from './components/GroupFile';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { PeoplePanel } from './components/PeoplePanel';
import { SettlementPanel } from './components/SettlementPanel';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CURRENCIES, CURRENCY_NAME, isCurrencyCode } from './lib/currency';
import { routeName, type RouteName } from './lib/route';
import { sampleDinner } from './lib/sample';
import { openRoute, sharedGroupFromLocation } from './sharedGroup';
import { useLedgerStore } from './store/ledgerStore';

export default function App() {
  const route = useRoute();
  const load = useLedgerStore((s) => s.load);
  useLayoutEffect(() => {
    const apply = () => {
      const shared = sharedGroupFromLocation();
      if (shared) load(shared);
    };
    const unsubscribe = useLedgerStore.persist.onFinishHydration(apply);
    apply();
    return unsubscribe;
  }, [load]);

  if (route === 'home') {
    return (
      <WelcomeScreen
        onStart={() => openRoute('group')}
        onSample={() => {
          load(sampleDinner());
          openRoute('group');
        }}
      />
    );
  }

  return <GroupScreen />;
}

function useRoute(): RouteName {
  const [route, setRoute] = useState(() => routeName(window.location.pathname));
  useEffect(() => {
    const sync = () => setRoute(routeName(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  return route;
}

function GroupScreen() {
  const hasPeople = useLedgerStore((s) => s.people.length > 0);
  const hasExpenses = useLedgerStore((s) => s.expenses.length > 0);
  const currency = useLedgerStore((s) => s.currency);
  const setCurrency = useLedgerStore((s) => s.setCurrency);
  const groupName = useLedgerStore((s) => s.groupName);
  const setGroupName = useLedgerStore((s) => s.setGroupName);
  const reset = useLedgerStore((s) => s.reset);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const editingId = useLedgerStore((s) => (s.expenses.some((expense) => expense.id === selectedId) ? selectedId : null));

  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <h1>Split It</h1>
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
          <GroupFile />
          {hasPeople && (
            <button type="button" className="ghost" onClick={() => setConfirmingReset(true)}>
              Start over
            </button>
          )}
        </div>
      </header>

      <div className={hasExpenses ? 'workspace has-bills' : 'workspace'}>
        <div className="column">
          <PeoplePanel />
          <ExpenseForm editingId={editingId} onDone={() => setSelectedId(null)} />
        </div>
        {hasExpenses && <ExpenseList onEdit={setSelectedId} />}
        {hasExpenses && (
          <div className="result">
            <SettlementPanel />
          </div>
        )}
      </div>

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
    </main>
  );
}
