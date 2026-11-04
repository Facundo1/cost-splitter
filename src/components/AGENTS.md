# Area: UI (`src/components/`, `src/App.tsx`, `src/hooks/`)

React 19 function components, plain CSS (`src/index.css`, CSS variables, dark mode via `prefers-color-scheme`).

## Data flow
- `App.tsx` owns the single state object `{ people, expenses }`, persisted with `useLocalStorage` under key `split-it:v1`.
- Derived data (`balances`, `transfers`) is computed with `useMemo` from `src/lib/settle.ts` — never stored.
- Components are presentational: they receive data + callbacks (`onAdd`, `onRemove`). No component reads `localStorage` directly.

## Components
- `PeoplePanel` — add/remove people; blocks duplicates (case-insensitive) and removing people referenced by expenses (`lockedIds`).
- `ExpenseForm` — tracks **excluded** people so new people are included by default; uses `parseAmountToCents`.
- `ExpenseList` — list + delete + total.
- `SettlementPanel` — transfers (`<ol aria-label="Transfers">`) and balances.

## Rules
- Accessible by default: every input has a label; tests query by role/label, so keep labels stable or update `src/App.test.tsx`.
- If the stored shape changes, bump `STORAGE_KEY` (no migrations by design).
- Money display always goes through `formatCents`.
- Keep styling in `index.css` with existing CSS variables; no CSS-in-JS or frameworks.
