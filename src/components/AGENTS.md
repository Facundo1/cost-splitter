# Area: UI (`src/components/`, `src/App.tsx`, `src/store/`)

React 19 function components, plain CSS (`src/index.css`, CSS variables, dark mode via `prefers-color-scheme`).

## Data flow
- `/` is the welcome screen. `/group` is the app. `src/sharedGroup.ts` reads and writes those paths. Do not add a router library for these two screens.
- A visit to `/group?g=…` loads the group after `parseLedgerBackup` accepts it, then drops the query. A broken `g` must not replace the current group. The read is latched so a later persist hydration cannot put the old browser save back on top of the link.
- Global state lives in a Zustand store (`src/store/ledgerStore.ts`), persisted to localStorage (`persist` middleware, key `split-it:v2`). Each action delegates to a pure function in `src/lib/ledger.ts`. Missing fields from an older save fall back to the current defaults (currency USD, empty payments).
- Panels read what they need with selectors (`useLedgerStore((s) => s.people)`), never the whole store. `useNameOf()` resolves ids to names.
- Component tests seed state with `useLedgerStore.setState(...)`; the test setup resets the store after each test.
- Derived data (`balances`, `transfers`) is computed on each render from `src/lib/settle.ts` — never stored. No `useMemo`: data is tiny.
- Components are presentational. Exchange rates are the exception: `src/rates/` owns the HTTP call (`ExchangeRateReader` + axios). The UI only asks for a quote. Settlement math never uses that rate.

## Components
- `WelcomeScreen` — the `/` screen. Start, or start from `sampleDinner()`, both open `/group`. Currency chosen here is the group's currency.
- `ConfirmDialog` — native `<dialog>` for destructive actions. Focus starts on Cancel.
- `Card` — titled section with an optional `action` slot.
- `PeoplePanel` — add/remove people. Blocks duplicates and removing anyone who is on a bill or a recorded payment.
- `ExpenseForm` — add or change a bill. New people are included unless excluded. Equal split is the default; parts are optional.
- `ExpenseList` — bills, change, delete, total.
- `SettlementPanel` — who pays whom, what each person spent, mark as paid, copy summary, WhatsApp, optional second currency.
- `GroupFile` — copy a link to this group, save a JSON copy, or open one. Open goes through `parseLedgerBackup` first. The link uses `groupLink`.

## Rules
- New business rules go in `src/lib/ledger.ts` with unit tests, not in components.
- Don't create a shared component until a pattern appears 3 times.
- Accessible by default: every input has a label; tests query by role/label, so keep labels stable or update `src/App.test.tsx`.
- A new required field should default in the persist `merge`, not silently break an older save.
- Money display always goes through `formatCents`. `convertCents` is a hint next to that amount, never a stored amount.
- Keep styling in `index.css` with existing CSS variables; no CSS-in-JS or frameworks.
