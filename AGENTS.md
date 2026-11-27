# AGENTS.md — Rules for the AI building FOODOO

Read this file first, then `SPEC.md`, `DESIGN.md`, `PLAN.md`. When files disagree, the order of authority is: this file > SPEC.md > DESIGN.md > PLAN.md.

## 1. Context

- **Product:** FOODOO, an offline-first Progressive Web App that suggests daily cooking portions for small food stalls (_warung_) and corrects for demand hidden by sold-out days.
- **Competition:** STACK 2026 by GDGoC ITB, Case 2: Stronger Communities and Everyday Services.
- **Team:** Calon Mantu Idaman: Samuel Matthew, Vassel Goleyu, Hakim Ulinnuha, Sonny Ferdinand.
- **Your job:** build the application only. The proposal, video, and pitch deck are out of scope.
- **Source of truth for scope:** the team's submitted abstract. Do not add, remove, or replace anything it promises. `SPEC.md` restates it.

## 2. Locked technical decisions (from the submitted abstract)

| Area    | Decision                                                     | Do not                                                  |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| App     | React 18 + TypeScript (strict) + Vite                        | Switch to Next.js, React Native, or any other framework |
| Offline | `vite-plugin-pwa` (service worker + manifest), installable   | Require network for any core flow                       |
| Storage | Dexie.js over IndexedDB, on-device only                      | Add a backend, database server, login, or cloud sync    |
| Logic   | Deterministic rules in pure TypeScript                       | Use any AI/ML model or LLM API inside the product       |
| Demo    | Synthetic data, clearly labelled                             | Present synthetic data as real                          |
| Tests   | Vitest (unit), Playwright (end-to-end)                       | Ship domain logic without tests                         |
| Routing | React Router                                                 |                                                         |
| Styling | Plain CSS with CSS custom properties (tokens in `DESIGN.md`) | Add a UI kit that hides the design system               |

Allowed extra dependencies: `react-router-dom`, `dexie`, `dexie-react-hooks`, `vite-plugin-pwa`, `vitest`, `@testing-library/react`, `@playwright/test`, `eslint`, `prettier`, `seedrandom`. Ask before adding anything else, and record every dependency in the README's third-party table.

## 3. Competition rules you must enforce in the code and repo

1. **English.** All code, identifiers, commit messages, README, and docs are in English. UI copy is English by default with a Bahasa Indonesia toggle (see `DESIGN.md`).
2. **No fabrication.** Never invent user counts, interview results, test results, or performance numbers. Any number shown in the app or docs must come from code that computes it or from data the team provides.
3. **Label simulated data.** Synthetic data must show a visible "Demo data" badge in the UI and be marked in the README. Estimated values must be labelled "estimate".
4. **Planned is not done.** A feature counts as done only when it meets its acceptance criteria in `SPEC.md` and passes its tests. Unfinished UI must be hidden or labelled "Coming soon". The feature status table in `PLAN.md` is the single source of truth.
5. **No secrets.** There are no API keys in this project. Never commit `.env` files, tokens, or credentials.
6. **No personal data.** Store no customer data. Store stall data on the device only. Provide export and delete-all.
7. **Attribution.** Record every library, font, icon set, and dataset in the README with its licence.
8. **Originality.** Write the solution from scratch for STACK 2026. Do not copy an existing app or template beyond the standard Vite scaffold.

## 4. Human-in-the-loop (required by the competition)

The competition requires that the registered members develop the substantive solution and can explain it. You assist; the team owns the work.

- **Module owners** (the team may reassign; update this table if they do):

| Module                                                 | Owner           | Folder                                  |
| ------------------------------------------------------ | --------------- | --------------------------------------- |
| Domain logic: demand estimation, suggestions, backtest | Hakim Ulinnuha  | `src/domain/`, `scripts/`               |
| Data layer: Dexie schema, repositories, export/import  | Samuel Matthew  | `src/db/`                               |
| Screens and components                                 | Vassel Goleyu   | `src/screens/`, `src/components/`       |
| PWA, i18n, accessibility, tests, deploy                | Sonny Ferdinand | `src/app/`, `src/i18n/`, `e2e/`, config |

- **Stop at every checkpoint** in `PLAN.md`. Summarise what changed and how to verify it, then wait for the owner's approval before continuing.
- **Commits are made by the owner.** Prepare the change and propose a commit message. If the team asks you to commit, add `Co-Authored-By` for the AI and keep the owner as the author.
- **Decision log.** After each phase, append to `docs/DECISIONS.md`: each technical decision, the alternatives considered, and why. Write it so the owner can explain it to a judge in under a minute.
- **AI usage log.** After each session, append a row to the README's "AI assistance" table: date, tool, which module, what the AI did, and who reviewed it.

## 5. Final Day rule

Do **not** implement the tasks marked `RESERVED FOR FINAL DAY` in `PLAN.md` before the team creates the Git tag `final-day-start`. The competition scores progress made during the Final Day build session. The app must still have one complete core flow before that tag.

## 6. Code conventions

- **File header:** the first line of every source file is a single comment with its path, e.g. `// src/domain/estimate.ts`. Add no other comments, notes, or emoji in code bodies. Explanations go in `docs/DECISIONS.md`.
- **Icons:** inline SVG components in `src/components/icons/`, stroke-based, 24 px grid. No emoji in the UI.
- TypeScript `strict: true`. Do not use `any`.
- Domain functions are pure: no Dexie, React, `Date.now()`, or randomness inside `src/domain/`. Pass time and data in as arguments.
- Money is an integer in rupiah. Quantities are integers. Times are `"HH:MM"` strings in local stall time. Dates are `"YYYY-MM-DD"`.
- Names: components `PascalCase.tsx`, everything else `camelCase.ts`. One component per file.
- Formatting: Prettier defaults. ESLint must pass with zero warnings.

## 7. Repository layout

```
foodoo/
  AGENTS.md  SPEC.md  DESIGN.md  PLAN.md  README.md  LICENSE
  docs/DECISIONS.md  docs/BACKTEST.md
  public/  (icons, manifest assets)
  src/
    app/          App.tsx, routes, layout, PWA registration
    screens/      Onboarding, Today, Plan, Service, Close, Summary, Settings
    components/   shared UI + icons/
    domain/       types.ts, time.ts, estimate.ts, suggest.ts, metrics.ts
    db/           schema.ts, repositories.ts, exportImport.ts
    demo/         generator.ts, seed.ts
    i18n/         en.ts, id.ts, index.ts
    styles/       tokens.css, base.css
  scripts/        backtest.ts
  tests/          unit tests mirroring src/domain and src/db
  e2e/            Playwright tests
```

## 8. Definition of Done (every task)

1. Its acceptance criteria in `SPEC.md` pass.
2. `npm run lint`, `npm test`, and `npm run build` all pass. `npm run e2e` passes once e2e exists.
3. It works offline after the first load.
4. Every visible string is in both `en.ts` and `id.ts`.
5. The feature status table in `PLAN.md` and the README status section are updated, matching each other exactly.
6. The decision log and AI usage log are updated.

## 9. README requirements (maintain continuously)

The README must always contain these sections, because the judges check them:

1. Overview: problem, users, the core loop.
2. Feature status table (same as `PLAN.md`).
3. Setup instructions, dependencies, supported environment (Node version, browsers).
4. Demo access: deployed URL, how to load demo data, how to reset it.
5. Local fallback: how to run the production build offline.
6. Data and privacy.
7. Third-party resources with licences.
8. AI assistance table.
9. Known limitations, including what is simulated or unfinished.
10. Final Day log: starting commit, final commit, changes during the session, member contributions.
11. Backtest results (from `docs/BACKTEST.md`, generated, never typed by hand).
