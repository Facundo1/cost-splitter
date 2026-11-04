# 🧾 Split It

[![CI](https://github.com/Facundo1/cost-splitter/actions/workflows/ci.yml/badge.svg)](https://github.com/Facundo1/cost-splitter/actions/workflows/ci.yml)

Split group expenses (a dinner, a trip, a shared flat) and find out **who pays whom, with the fewest transfers**.

**Live demo:** https://Facundo1.github.io/cost-splitter/

Add people → add expenses (who paid, who it's split between) → get the list of transfers that settles everyone. Data stays in your browser — no account, no server.

## Quick start

Requires Node 20+ (`.nvmrc` pins 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server with HMR                           |
| `npm test`          | Unit + component tests (Vitest, jsdom)        |
| `npm run test:watch`| Tests in watch mode                           |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | `tsc --noEmit` (strict)                       |
| `npm run check`     | Lint + typecheck + test — same as CI          |
| `npm run build`     | Production build to `dist/`                   |
| `npm run preview`   | Serve the production build locally           |

## How it works

```
src/
├── lib/                 # Pure domain logic — no React, fully unit-tested
│   ├── types.ts         # Person, Expense, Transfer
│   ├── money.ts         # Parse/format money as integer cents
│   └── settle.ts        # Balances + greedy settlement algorithm
├── components/          # Presentational React components
├── hooks/
│   └── useLocalStorage.ts
├── App.tsx              # State + wiring
└── App.test.tsx         # User-flow tests (Testing Library)
```

1. **Balances.** Each expense adds its amount to the payer and subtracts an equal share from each participant. Leftover cents (e.g. 100 ÷ 3) are assigned deterministically so balances always sum to exactly zero.
2. **Settlement.** Repeatedly match the biggest debtor with the biggest creditor. This yields at most *n − 1* transfers. The true minimum is NP-hard; greedy is optimal or very close for group-sized inputs.

All money is stored as **integer cents** — no floating-point rounding bugs.

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and PR: lint → typecheck → test → build. On `main`, the build is deployed to GitHub Pages.

> To enable deploys on a fork: *Settings → Pages → Source: GitHub Actions*.

## Decisions & trade-offs

See [DECISIONS.md](DECISIONS.md) — what I chose, what I deliberately left out, and how AI was used.
