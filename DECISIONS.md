# Decisions & trade-offs

The core app (domain logic, UI, tests, CI) was built in the ~1 hour time box. Later sections document follow-up changes that were requested after that (AI context, refactors, WhatsApp sharing, UI polish, Zustand), each with its own reasoning. This file is the "why" behind the repo.

## Why this app

Splitting the bill after an asado or a trip is a problem I actually have. It's small, but it has a real core (money math + a settlement algorithm) that's worth testing properly, instead of a UI-only toy.

## Stack

| Choice | Why |
| --- | --- |
| **Vite + React + TypeScript** | Fastest path from blank page to a deployed SPA. React is overkill for 4 components, but it's the stack reviewers can read instantly and I'd extend without rewriting. |
| **No backend** | The problem doesn't need one for a single user. `localStorage` gives persistence for free. |
| **Zustand** (+ `persist`) | Added on request — originally skipped as YAGNI (see "Global state" below). Smallest option that gives global state *and* persistence with no providers or boilerplate. |
| **Plain CSS with variables** | ~150 lines, dark mode via `prefers-color-scheme`. Tailwind/UI kits would add setup time and dependencies for no gain here. |
| **Strict TS** (`strict`, `noUncheckedIndexedAccess`) | Cheap to turn on at the start, expensive to turn on later. |

## Structure

The key split is **`src/lib` (pure functions) vs. `src/components` (React)**. All the logic that can be wrong in an interesting way — parsing money, splitting cents, settling debts — lives in `lib/` with no React dependency, so it's trivially unit-testable and could be reused (e.g. in a backend) unchanged.

## Testing

- **Unit tests (Vitest)** on `lib/` (money, settlement, ledger operations): money parsing edge cases, leftover-cent distribution, the invariant that balances sum to zero, and a property-style check that transfers fully settle every balance with ≤ n−1 transfers.
- **Component tests (Testing Library)** on the main user flow: add people → add expense → see transfers; persistence; duplicate names.
- Queries are by accessible label/role, which doubles as a light accessibility check.

## Money

Amounts are **integer cents** end to end. Input like `19.99` is parsed with string operations, not `parseFloat * 100` (which gives `1998.9999…`). Uneven splits (100 / 3) distribute the leftover cent deterministically so nothing is lost or invented.

## CI/CD

One GitHub Actions workflow: `npm ci → lint → typecheck → test → build` on every push/PR, then deploy to GitHub Pages on `main`. Concurrency cancels stale runs. Node version comes from `.nvmrc` so local and CI match.

## Sharing to WhatsApp

"Share on WhatsApp" opens `https://wa.me/?text=<message>`: WhatsApp (app or web) opens with the summary pre-filled and the user picks any chat or group.

- **Why a link and not the WhatsApp API:** the Business/Cloud API needs a business account, access tokens, a server to keep them secret and approved message templates — and it can't post to groups. A link gives the actual feature (send the summary to my group) with zero infra.
- **The message adapts to the data**: every expense (payer + who it was split between), total, what each person spent (no average — users care about their own number, not the mean), transfers (or "everyone's even"), singular/plural, and a thank-you to whoever paid the most. Uses WhatsApp's `*bold*`/`_italic_`.
- **Message building is a pure function** (`settlementMessage(ledger)` in `src/lib/share.ts`) that takes the whole ledger and derives everything itself, with unit tests per section; the component only renders the link. The URL test round-trips the text through `URL` to prove line breaks, emoji, `&` and `$` survive encoding.
- **Left out:** Web Share API (native share sheet on mobile — nice, but WhatsApp is the ask and `wa.me` works on desktop too); copy-to-clipboard; a Spanish message (the app is English; i18n is out of scope); random/rotating phrasings ("dynamic" here means driven by the data, which keeps it deterministic and testable).

## UI polish: inputs and the select

- **Input filtering instead of error messages.** The amount field only accepts digits, one `.`/`,` and up to 2 decimals; names reject digits. The rules are pure functions (`isAmountInput`, `isNameInput`) with unit tests, and still back up `parseAmountToCents` — filtering is UX, parsing is the source of truth. The description field stays free text on purpose ("2 pizzas", "Airbnb x3").
- **`<select>` dropdown below the field, same width.** The native picker is drawn by the OS and can't be positioned with CSS. I used the new customizable select (`appearance: base-select` + anchor positioning) as **progressive enhancement**: Chromium gets the styled list; other browsers fall back to the native picker, still fully accessible. Rejected: a custom JS dropdown (re-implementing keyboard nav, focus and ARIA for one field) and a headless UI library (a dependency for one control).

## Global state: Zustand

Requested change: move from local state + a `useLocalStorage` hook to a global state library.

- **Clarified first:** Zustand/Redux/Context manage in-memory state; they don't replace localStorage, which is what makes data survive a reload. So the choice was "which state library *plus* persistence".
- **Zustand + `persist` middleware.** ~1 KB, no provider, no reducers/action types; `persist` replaces the hand-written hook. Redux Toolkit is more ceremony than 5 actions justify; Context has no persistence and re-renders every consumer on any change.
- **The store is a thin wrapper.** Each action delegates to the pure functions in `lib/ledger.ts`, so the business rules and their tests didn't change at all. That's the payoff of keeping the domain separate from React: swapping the state container touched only the wiring.
- **Components read the store with selectors** instead of receiving props from `App`, which now just lays out panels.
- **Storage key bumped to `split-it:v2`**: `persist` stores `{ state, version }`, a different shape than before. Old local data is ignored rather than migrated (no real users yet).
- **Honest trade-off:** at this size there was no prop-drilling pain (one level of props). I'd originally left it out as YAGNI; it's cheap now and makes adding panels easier, but it wasn't solving a problem we had.

## Reset confirmation

Replaced `window.confirm` with a `ConfirmDialog` built on the native `<dialog>` (`showModal`): focus trap, Esc to close, backdrop and top-layer rendering come from the browser, so no modal library. It opens with focus on **Cancel** (the safe action) and uses `role="alertdialog"` because it interrupts a destructive action. jsdom doesn't implement `<dialog>` yet, so the test setup has a 6-line stand-in for `showModal`/`close`.

## Engineering principles — what I applied, and where I stopped

Reviewed the code against reusability, DRY, YAGNI, SOLID and unit testing. Each principle is a tool, not a checklist: I applied it where it removed a real problem and skipped it where it would only add structure.

### Applied

| Change | Principle | Why it was worth it |
| --- | --- | --- |
| State operations moved from `App.tsx` to pure functions in `src/lib/ledger.ts` (`addPerson`, `removePerson`, `addExpense`, `removeExpense`) | **SRP**, testability | `App` was doing UI *and* business rules. Now `App` only wires state to components, and the rules are unit-tested without rendering anything. |
| "Can't remove someone with expenses" and "no duplicate names" enforced in the domain, not only by disabled buttons | **SRP**, correctness | A rule that lives only in the UI is a suggestion. The UI still disables the button for UX, but the domain is the source of truth. |
| `isNameTaken` / `peopleWithExpenses` shared by UI and domain | **DRY** | The duplicate-name check existed in the UI and was needed in the domain: same rule, one implementation. |
| `Card` component | **DRY / reuse** | The same `section + h2 + aria-labelledby` block was repeated in 4 components (rule of three met). `useId` removed the hand-written heading ids. |
| `ExpenseForm` builds one `draft` (or `null`) | **DRY** | Validation was written twice (button `disabled` and submit handler) and could drift. Now one expression drives both. |
| Unit tests for `ledger`, the persisted state (incl. corrupt data) and `ExpenseForm` in isolation | **Unit tests** | These were the untested seams. 28 → 48 tests. |

### Deliberately not applied

| Not done | Principle it would serve | Why not |
| --- | --- | --- |
| `RemoveButton` component | DRY | Only 2 uses with different styles. Rule of three not met; the abstraction would need props for every difference. |
| `useReducer` / Redux / Zustand / a `LedgerService` class | SOLID "purity" | Plain pure functions + `setState(l => fn(l))` give the same testability with zero ceremony. **YAGNI.** |
| Storage interface injected into the hook (DIP) | **DIP** | One storage backend, and jsdom's `localStorage` already makes it testable. I'd add the seam the day a second backend (URL, API) actually exists. |
| OCP plugin points (e.g. pluggable split strategies) | **OCP** | Only one split strategy exists. Designing the extension point before the second case means guessing its shape. When uneven splits arrive, `splitAmong` becomes `{ personId, weight }[]` — a data change, not a framework. |
| LSP / ISP | — | No inheritance and only tiny prop interfaces; there's nothing for them to act on. Name-dropping them here would be theater. |
| Unit tests for `ExpenseList`, `SettlementPanel`, `Card` | Unit tests | Purely presentational; covered by the `App` user-flow test. Testing them alone would assert markup, not behavior. |
| Coverage threshold in CI | Unit tests | A % target rewards testing trivial code. Tests target the money math, invariants and user flows instead. |
| `useMemo` / `useCallback` | Performance | Inputs are tens of items; memoization would add noise and dependency arrays to get wrong. |

## AI context ("RAG for the codebase")

Goal: any AI assistant gets focused context per area without burning tokens reading the whole repo.

- **Hierarchical, on-demand retrieval instead of a vector DB.** A root `AGENTS.md` (always loaded, ~40 lines) works as a router: task → area → files. Each area has its own `AGENTS.md` with its invariants and rules, loaded only when the model works there. `AGENTS.md` is the cross-tool standard; `CLAUDE.md` just imports it, so there's one source of truth.
- **Generated symbol map** (`.ai/INDEX.md`): file → exports → size. The model finds the right file in one small read instead of exploring.
- **Freshness enforced by CI** (`npm run context:check`): stale AI context is worse than none, so it's treated like a failing test.
- **Explicit "never read" list** (`node_modules`, `dist`, lockfile): the biggest token sinks.
- **Why not embeddings + vector store?** For ~15 files, chunking/embedding/retrieval adds infra, latency and a second source of truth, and semantic chunks lose the structure (invariants, ownership) that matters for code. I'd revisit it at hundreds of files or when pulling in external docs (tickets, ADRs). Code search (grep/LSP) + curated area context beats it at this size.

## Deliberately left out

Things I knowingly skipped to stay in the time box, roughly in the order I'd add them:

1. **Shareable ledger link** — encode the state in the URL so the group can *open and edit* the same ledger without a backend (today WhatsApp sharing sends a read-only summary).
2. **Uneven splits** — percentages / shares / exact amounts. The domain model (`splitAmong`) would become `{ personId, weight }[]`.
3. **A different currency on each bill** — the group picks one of USD, ARS, or EUR. A second currency is display-only (see below). Switching the group currency relabels amounts; it does not convert bills already added.
4. **Runtime validation of stored data** (e.g. Zod). Today a versioned storage key (`split-it:v2`) is the migration strategy.
5. **E2E tests (Playwright)** — the Testing Library flow test covers the critical path; a real browser test would be next.
6. **Optimal settlement** — greedy can occasionally use one more transfer than the true minimum. Exact solutions are exponential; not worth it for groups of < 15 people.
7. **Pre-commit hooks, Prettier, Dependabot, coverage thresholds** — good hygiene for a team repo, noise for a 1-hour solo project. CI already enforces lint + types + tests.
8. **Backend, accounts, sync, i18n** — out of scope for the problem size.

## Another currency, display only

The settlement stays in integer cents of the group's currency. "Also show in" multiplies those cents by a live rate and rounds to the nearest cent. That number is a hint, never an input to `settle`.

Frankfurter publishes ECB rates and does not list ARS, which the group can pick. The reader calls the public [currency-api](https://github.com/fawazahmed0/currency-api) dataset instead: no key, USD/EUR/ARS included, jsDelivr first and `latest.currency-api.pages.dev` if that host fails.

**Axios** is the HTTP adapter behind `ExchangeRateReader`. Tests pass a fake `getJson`, so the app never needs the network to prove the parser or the fallback. If both hosts fail, the last successful quote for that pair is shown with a plain message. If there is no saved quote, the screen says the amounts stay in the group's currency.

## How AI was used

Built with Claude Code as the main pair programmer.

- **Where it accelerated:** scaffolding config (Vite, Vitest, ESLint flat config, Actions workflow), first drafts of components and CSS, and generating test cases for edge cases (cent remainders, input parsing).
- **Where I steered it:** I fixed the scope and the list of cuts up front; insisted on integer cents and on keeping the algorithm in pure functions separate from React; and pushed tests toward invariants (balances sum to zero, everyone settled) rather than only snapshot-style expected outputs.
- **What I reviewed by hand:** the settlement algorithm and the rounding logic — the parts where a plausible-looking bug would silently produce wrong money.
