# Decisions & trade-offs

Time-boxed to ~1 hour. This file is the "why" behind the repo.

## Why this app

Splitting the bill after an asado or a trip is a problem I actually have. It's small, but it has a real core (money math + a settlement algorithm) that's worth testing properly, instead of a UI-only toy.

## Stack

| Choice | Why |
| --- | --- |
| **Vite + React + TypeScript** | Fastest path from blank page to a deployed SPA. React is overkill for 4 components, but it's the stack reviewers can read instantly and I'd extend without rewriting. |
| **No backend** | The problem doesn't need one for a single user. `localStorage` gives persistence for free. |
| **No state library** | One `useState` object in `App` + a `useLocalStorage` hook. Redux/Zustand would be ceremony at this size. |
| **Plain CSS with variables** | ~150 lines, dark mode via `prefers-color-scheme`. Tailwind/UI kits would add setup time and dependencies for no gain here. |
| **Strict TS** (`strict`, `noUncheckedIndexedAccess`) | Cheap to turn on at the start, expensive to turn on later. |

## Structure

The key split is **`src/lib` (pure functions) vs. `src/components` (React)**. All the logic that can be wrong in an interesting way — parsing money, splitting cents, settling debts — lives in `lib/` with no React dependency, so it's trivially unit-testable and could be reused (e.g. in a backend) unchanged.

## Testing

- **Unit tests (Vitest)** on `lib/`: money parsing edge cases, leftover-cent distribution, the invariant that balances sum to zero, and a property-style check that transfers fully settle every balance with ≤ n−1 transfers.
- **Component tests (Testing Library)** on the main user flow: add people → add expense → see transfers; persistence; duplicate names.
- Queries are by accessible label/role, which doubles as a light accessibility check.

## Money

Amounts are **integer cents** end to end. Input like `19.99` is parsed with string operations, not `parseFloat * 100` (which gives `1998.9999…`). Uneven splits (100 / 3) distribute the leftover cent deterministically so nothing is lost or invented.

## CI/CD

One GitHub Actions workflow: `npm ci → lint → typecheck → test → build` on every push/PR, then deploy to GitHub Pages on `main`. Concurrency cancels stale runs. Node version comes from `.nvmrc` so local and CI match.

## Deliberately left out

Things I knowingly skipped to stay in the time box, roughly in the order I'd add them:

1. **Shareable link** — encode the state in the URL so a group can share one ledger without a backend. Highest value next step.
2. **Edit an expense** — today you delete and re-add.
3. **Uneven splits** — percentages / shares / exact amounts. The domain model (`splitAmong`) would become `{ personId, weight }[]`.
4. **Multi-currency** — `$` is hardcoded; amounts are assumed to be in one currency.
5. **Runtime validation of stored data** (e.g. Zod). Today a versioned storage key (`split-it:v1`) is the migration strategy, and corrupt data falls back to empty.
6. **E2E tests (Playwright)** — the Testing Library flow test covers the critical path; a real browser test would be next.
7. **Optimal settlement** — greedy can occasionally use one more transfer than the true minimum. Exact solutions are exponential; not worth it for groups of < 15 people.
8. **Pre-commit hooks, Prettier, Dependabot, coverage thresholds** — good hygiene for a team repo, noise for a 1-hour solo project. CI already enforces lint + types + tests.
9. **Backend, accounts, sync, i18n** — out of scope for the problem size.

## How AI was used

Built with Claude Code as the main pair programmer.

- **Where it accelerated:** scaffolding config (Vite, Vitest, ESLint flat config, Actions workflow), first drafts of components and CSS, and generating test cases for edge cases (cent remainders, input parsing).
- **Where I steered it:** I fixed the scope and the list of cuts up front; insisted on integer cents and on keeping the algorithm in pure functions separate from React; and pushed tests toward invariants (balances sum to zero, everyone settled) rather than only snapshot-style expected outputs.
- **What I reviewed by hand:** the settlement algorithm and the rounding logic — the parts where a plausible-looking bug would silently produce wrong money.
