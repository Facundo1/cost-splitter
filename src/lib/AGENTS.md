# Area: domain logic (`src/lib/`)

Pure TypeScript. The only place where money and settlement are computed. Highest-risk code: a bug here silently produces wrong amounts.

## Files
- `types.ts` — `Person`, `Expense`, `Transfer`. `Expense.amountCents` is an integer; `splitAmong` is non-empty.
- `money.ts` — `parseAmountToCents(input)` (string parsing, accepts `,` or `.`, ≤ 2 decimals, returns `null` if invalid) and `formatCents`.
- `ledger.ts` — `Ledger` (`{ people, expenses }`, the whole app state) and pure operations: `addPerson`, `removePerson`, `addExpense`, `removeExpense`, `isNameTaken`, `peopleWithExpenses`, `totalCents`. Business rules live here (no duplicate names, can't remove someone with expenses), not in the UI.
- `share.ts` — `settlementMessage(ledger)` (WhatsApp-formatted summary: expenses, total, what each person spent, transfers, top payer) and `whatsappShareUrl(text)` (`wa.me` link, no API).
- `settle.ts` — `computeShares(people, expenses)` → what each person consumed; `computeBalances(people, expenses)` → `Map<id, cents>` (paid − share; positive = is owed); `settle(balances)` → `Transfer[]` (greedy, ≤ n−1 transfers).

## Invariants (tests enforce them — keep them true)
- Balances always sum to exactly 0. Leftover cents go to the first participants in `splitAmong` order.
- Applying `settle()` transfers brings every balance to 0; every transfer amount > 0.
- Greedy is **not** always minimal (known, tested counterexample). Exact minimum is NP-hard — don't "fix" without discussing.

## Rules
- No imports from React, DOM, or `../components`.
- Never `parseFloat(x) * 100`; parse money as strings.
- Add/adjust tests in `*.test.ts` next to the file. Prefer invariant/property-style assertions over hard-coded outputs.

## Likely next changes (see DECISIONS.md)
Uneven splits → `splitAmong: { personId, weight }[]`; multi-currency → amounts carry a currency code.
