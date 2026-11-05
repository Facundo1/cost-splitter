# Split It — AI agent guide

Tool-agnostic context for AI coding assistants (Claude Code reads it via `CLAUDE.md`; Codex/Cursor/others read `AGENTS.md`).
Keep this file short: it is loaded on **every** prompt. Area details live next to the code and load only when needed.

## What this is
Vite + React 19 + TypeScript SPA, Zustand for state. Splits group expenses and computes who pays whom. No backend; state in `localStorage`. `/` is the welcome screen and `/group` is the app. A `?g=` link reopens the same group.

## Retrieval: where to look (read only what the task needs)

| Task touches… | Read first | Area guide |
| --- | --- | --- |
| Money math, balances, settlement algorithm | `src/lib/` | [src/lib/AGENTS.md](src/lib/AGENTS.md) |
| Live exchange rate | `src/rates/` | [src/lib/AGENTS.md](src/lib/AGENTS.md) |
| UI, forms, state, persistence, routes | `src/components/`, `src/App.tsx`, `src/sharedGroup.ts`, `src/store/` | [src/components/AGENTS.md](src/components/AGENTS.md) |
| CI/CD, lint, build, test config | `.github/workflows/ci.yml`, `vite.config.ts`, `eslint.config.js` | this file (below) |
| Product decisions, scope, what's out | `DECISIONS.md` | — |

**Symbol map:** [.ai/INDEX.md](.ai/INDEX.md) lists every source file with its exports. Check it *before* opening files to find the right one. It is generated (`npm run context`) and CI fails if it's stale.

## Never read (no useful context, huge token cost)
`node_modules/`, `dist/`, `coverage/`, `package-lock.json`.

## Commands
- `npm run check` — lint + typecheck + context check + tests (run before declaring done)
- `npm test` / `npm run test:watch`
- `npm run dev` — http://localhost:5173
- `npm run context` — regenerate `.ai/INDEX.md` after adding/renaming files or exports

## Global rules
1. Money is **integer cents** everywhere. Never use floats for amounts.
2. `src/lib/` stays pure: no React, no DOM, no `localStorage`.
3. Every change to `src/lib/` comes with tests. UI changes: update `src/App.test.tsx` if the user flow changes.
4. Strict TS (`noUncheckedIndexedAccess`). No `any`, no `// @ts-ignore`.
5. Don't add dependencies without a reason written in `DECISIONS.md`.
6. Out of scope unless asked: backend, auth, state libraries, CSS frameworks (see "Deliberately left out" in `DECISIONS.md`).

## CI/CD
`.github/workflows/ci.yml`: `npm ci → lint → typecheck → context:check → test → build` on push/PR; deploys `dist/` to GitHub Pages on `main`. Node version from `.nvmrc`. `scripts/group-page.mjs` adds `dist/group/index.html` during the build so `/group` reloads on Pages.
