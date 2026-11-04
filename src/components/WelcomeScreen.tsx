import { CURRENCIES, CURRENCY_NAME, isCurrencyCode } from '../lib/currency';
import { useLedgerStore } from '../store/ledgerStore';

export const SESSION_KEY = 'split-it:started';

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const currency = useLedgerStore((s) => s.currency);
  const setCurrency = useLedgerStore((s) => s.setCurrency);

  return (
    <main className="welcome">
      <p className="eyebrow">Split It</p>
      <h1>See who should pay whom.</h1>
      <p className="lede">
        After a dinner, a trip, or a shared apartment, write down what each person paid. Split It shows the fewest payments that settle everyone.
      </p>
      <ol className="steps">
        <li>Add the people.</li>
        <li>Add each bill, who paid, and who shares it.</li>
        <li>See who pays whom.</li>
      </ol>
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
      <p className="muted small">You can change this later. It names the money. It does not convert bills you already added.</p>
      <button type="button" onClick={onStart}>
        Start
      </button>
    </main>
  );
}
