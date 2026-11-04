# Area: UI (`src/components/`, `src/App.tsx`, `src/store/`)

React 19 function components, plain CSS (`src/index.css`, CSS variables, dark mode via `prefers-color-scheme`).

## Data flow
- Global state lives in a Zustand store (`src/store/ledgerStore.ts`), persisted to localStorage (`persist` middleware, key `split-it:v2`). Each action just delegates to a pure function in `src/lib/ledger.ts` — no business logic in the store or in components.
- Panels read what they need with selectors (`useLedgerStore((s) => s.people)`), never the whole store. `useNameOf()` resolves ids to names.
- Component tests seed state with `useLedgerStore.setState(...)`; the test setup resets the store after each test.
- Derived data (`balances`, `transfers`) is computed on each render from `src/lib/settle.ts` — never stored. No `useMemo`: data is tiny.
- Components are presentational: they receive data + callbacks (`onAdd`, `onRemove`). No component reads `localStorage` directly.

## Components
- `ConfirmDialog` — native `<dialog>` modal for destructive actions (used by Reset). Focus starts on Cancel.
- `Card` — titled section (`useId` for the accessible heading) with an optional `action` slot on the right of the title. Use it for every new panel.
- `PeoplePanel` — add/remove people; blocks duplicates (case-insensitive) and removing people referenced by expenses (`lockedIds`).
- `ExpenseForm` — tracks **excluded** people so new people are included by default; uses `parseAmountToCents`.
- `ExpenseList` — list + delete + total.
- `SettlementPanel` — transfers (`<ol aria-label="Transfers">`), "Share on WhatsApp" link (text built in `src/lib/share.ts`) and "Spent per person" (shares, not balances).

## Rules
- New business rules go in `src/lib/ledger.ts` with unit tests, not in components.
- Don't create a shared component until a pattern appears 3 times.
- Accessible by default: every input has a label; tests query by role/label, so keep labels stable or update `src/App.test.tsx`.
- If the stored shape changes, bump `STORAGE_KEY` (no migrations by design).
- Money display always goes through `formatCents`.
- Keep styling in `index.css` with existing CSS variables; no CSS-in-JS or frameworks.
