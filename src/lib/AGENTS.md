# Area: domain logic (`src/lib/`)

Pure TypeScript. The only place where money and settlement are computed. Highest-risk code: a bug here silently produces wrong amounts.

## Files
- `types.ts` — `Person`, `Expense`, `Payment`, `Transfer`. `Expense.amountCents` is an integer. `splitAmong` is non-empty. Optional `parts` means an unequal split (1 part is an equal share).
- `money.ts` — `parseAmountToCents` (string parsing, `,` or `.`, ≤ 2 decimals), `formatCents(cents, currency)`, `convertCents` (display only).
- `ledger.ts` — `Ledger` (people, expenses, payments, currency, group name) and pure operations. Business rules live here, not in the UI.
- `settle.ts` — shares, balances (expenses, then payments), greedy settlement.
- `share.ts` — WhatsApp summary and `wa.me` link. No WhatsApp API.
- `backup.ts` — `serializeLedger` / `parseLedgerBackup`. A bad file returns null and must not be loaded.
- `link.ts` — `encodeGroupParam` / `ledgerFromSearch`. Same JSON as a backup, base64url in `?g=`. A bad value returns null.
- `route.ts` — `routeName` / `routePath`. `/` is the welcome screen. `/group` is the app. The project prefix (`/cost-splitter`) stays in front of both.
- `currency.ts` — `USD`, `ARS`, `EUR`.
- `sample.ts` — `sampleDinner()`.

## Invariants (tests enforce them — keep them true)
- Balances always sum to exactly 0. Leftover cents go to the first participants in `splitAmong` order.
- Applying `settle()` transfers brings every balance to 0; every transfer amount > 0.
- Greedy is **not** always minimal (known, tested counterexample). Exact minimum is NP-hard — don't "fix" without discussing.

## Rules
- No imports from React, DOM, or `../components`.
- Never `parseFloat(x) * 100`; parse money as strings.
- Add/adjust tests in `*.test.ts` next to the file. Prefer invariant/property-style assertions over hard-coded outputs.

## Likely next changes (see DECISIONS.md)
A different currency on each bill. Parts already cover an unequal split without changing `splitAmong`. The share link already reuses `parseLedgerBackup`.
