import { CURRENCIES, CURRENCY_NAME, isCurrencyCode } from '../lib/currency';
import { useLedgerStore } from '../store/ledgerStore';

export function WelcomeScreen({ onStart, onSample }: { onStart: () => void; onSample: () => void }) {
  const currency = useLedgerStore((s) => s.currency);
  const setCurrency = useLedgerStore((s) => s.setCurrency);

  return (
    <main className="welcome">
      <p className="eyebrow">Split It</p>
      <h1>See who should pay whom.</h1>
      <label className="field">
        <span>Which money are you using?</span>
        <select
          value={currency}
          onChange={(event) => {
            if (isCurrencyCode(event.target.value)) setCurrency(event.target.value);
          }}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {CURRENCY_NAME[code]} ({code})
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <button type="button" onClick={onStart}>
          Start
        </button>
        <button type="button" className="ghost" onClick={onSample}>
          Start with a sample dinner
        </button>
      </div>
    </main>
  );
}
