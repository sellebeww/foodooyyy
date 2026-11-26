# Decision log

Each entry: the decision, the alternatives considered, and why. Appended after each phase. Owner names follow `AGENTS.md` section 4.

## Phase F0: Foundation (2026-11-25)

### D-001 Scaffold by hand, in the repository root (Sonny)

- **Decision:** write the Vite + React + TypeScript layout directly in the repo root, matching the `AGENTS.md` section 7 layout.
- **Alternatives:** `npm create vite` (adds `App.css`, sample assets and a nested folder we would then delete); a `foodoo/` subfolder (the layout lists `foodoo/` as the repo root itself).
- **Why:** nothing unwanted to remove, and the originality rule allows only the standard scaffold anyway.

### D-002 Pin Node 22.12.0 (Sonny)

- **Decision:** `.nvmrc` contains `22.12.0`, `package.json` has `engines: ">=22.12.0 <23"`, `.npmrc` sets `engine-strict=true` and `save-exact=true`. CI reads `.nvmrc`.
- **Alternatives:** Node 20 (below the Vite 7 and Vitest floors we want); an unpinned "latest LTS" (builds drift between machines and CI).
- **Why:** 22.12.0 is what the team machine runs, and one file drives local, CI and host.
- **Consequence:** some newest tool releases need Node 22.13 or higher, so we picked the newest versions that still run on 22.12 (see D-003).

### D-003 Dependency versions chosen for compatibility, not for "latest" (Sonny)

All versions are exact and in the lockfile. Where we are not on the newest release, the reason was observed during install:

| Package                     | Chosen | Newer exists | Reason we did not use it                                                                                                                                                                                                                                        |
| --------------------------- | ------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| react, react-dom            | 18.3.1 | 19           | `AGENTS.md` locks React 18                                                                                                                                                                                                                                      |
| react-router-dom            | 6.30.6 | 7            | stable with React 18; v7 flags enabled early to silence warnings                                                                                                                                                                                                |
| vite                        | 7.3.8  | 8            | `@vitejs/plugin-react` 6 needs Vite 8 and pulled Babel 8 into conflict with Babel 7 required by `workbox-build` (npm `ERESOLVE`)                                                                                                                                |
| @vitejs/plugin-react        | 5.2.0  | 6            | see above                                                                                                                                                                                                                                                       |
| typescript                  | 5.9.3  | 7            | `typescript-eslint` peer range is below 6.1                                                                                                                                                                                                                     |
| eslint, @eslint/js          | 9.39.5 | 10           | ESLint 10 needs Node 22.13 or higher                                                                                                                                                                                                                            |
| typescript-eslint           | 8.55.0 | 8.74         | later releases need `eslint-visitor-keys` 5, which needs Node 22.13 or higher                                                                                                                                                                                   |
| jsdom                       | 28.1.0 | 31           | jsdom 31 needs Node 22.22 or higher                                                                                                                                                                                                                             |
| vitest, @vitest/coverage-v8 | 3.2.7  | 5.1          | 5.1.1 installed but every test file failed with "failed to find the current suite", even a one-line test and in the node environment (root cause not investigated). 4.1.12 hit an npm 11.1.0 internal error (`edgesOut`) at install. 3.2.7 installs and passes. |

- **Also installed automatically:** `workbox-build` and `workbox-window` 7.4.1 are required peer dependencies of `vite-plugin-pwa` 2.0.0. They are not in the `AGENTS.md` allowed list by name, but the allowed plugin cannot work without them.
- **Revisit:** when the team upgrades Node, move to current releases and re-run the checkpoint commands.

### D-004 Lint: ESLint 9 flat config with type-aware rules (Sonny)

- **Decision:** `@eslint/js` recommended, `typescript-eslint` `recommendedTypeChecked`, `eslint-plugin-react-hooks`, `no-explicit-any` as an error. `npm run lint` runs ESLint with `--max-warnings 0`, then `prettier --check`.
- **Local rule:** a small inline rule in `eslint.config.js` fails any file in `src/`, `scripts/`, `tests/` or `e2e/` whose first line is not `// <its own path>`. This enforces `AGENTS.md` section 6 automatically instead of by review.
- **Alternatives:** a stricter shared config such as Airbnb (many extra plugins, noisy); `eslint-config-prettier` (not approved, and unnecessary because no stylistic ESLint rules are enabled).

### D-005 Prettier with defaults (Sonny)

- **Decision:** no `.prettierrc`; defaults apply as `AGENTS.md` requires. `.prettierignore` skips generated files, binaries, third-party documents and the four planning documents the team wrote.
- **Why:** zero configuration to explain, and we do not reformat the team's own specification files.

### D-006 Unit tests: Vitest with a per-folder coverage gate (Hakim, Sonny)

- **Decision:** jsdom environment, V8 coverage, and a threshold of 100% for lines, functions, branches and statements applied only to `src/domain/**/*.ts`.
- **Checked:** with a throwaway file in `src/domain` covered at 66%, `npm run test:coverage` exited with code 1 and listed all four thresholds; with the file removed it exits 0. The gate currently has nothing to measure because the domain layer starts in F1.
- **Alternatives:** a global threshold (would fail on UI code, which does not need 100%); Istanbul provider (slower, no benefit here).

### D-007 End-to-end tests: Playwright on the production build, offline-capable (Sonny)

- **Decision:** Chromium with the Pixel 7 profile, against `npm run build && npm run preview` on port 4173. Setting `E2E_BASE_URL` runs the same tests against the deployed URL. The offline check waits for the service worker, calls `context.setOffline(true)`, reloads, and asserts the page still renders.
- **Alternatives:** testing against the dev server (no service worker, so offline cannot be proven); adding Firefox and WebKit now (slower CI, little extra evidence at this stage).

### D-008 PWA baseline (Sonny)

- **Decision:** `vite-plugin-pwa` with `generateSW`, `registerType: "autoUpdate"`, precache of js, css, html, svg, png, woff2 and the manifest, `navigateFallback` to `index.html`, manifest with `standalone` display, navy theme and cream background, and 192, 512 and maskable 512 icons.
- **Placeholder icons:** `public/icons/icon.svg` is a temporary "FO / OD" mark with a diagonal infinity loop. `scripts/makeIcons.ts` renders the PNGs using Playwright's Chromium, so no image library was added. The real `AppIcon` component and final icons arrive in F2.
- **Alternatives:** `injectManifest` (more code for no gain); `@vite-pwa/assets-generator` or `sharp` (not approved dependencies).

### D-009 Self-hosted fonts, and the font mismatch (Sonny, Samuel)

- **Decision:** ship `Space Grotesk` (variable weight 500 to 700, latin subset) and `Rubik Mono One` (400, latin subset) as WOFF2 in `public/fonts/`, with their OFL texts. Declared in `src/styles/tokens.css`, preloaded for the UI font, precached by the service worker. The files were downloaded once from Google Fonts' static host; the app makes no font request at runtime.
- **Alternatives:** `@fontsource/*` packages (new dependencies); a font CDN (breaks offline use).
- **Mismatch to resolve:** `DESIGN.md` names Space Grotesk and Rubik Mono One. The submitted proposal's third-party table names Outfit, Inter, JetBrains Mono and Rubik Mono One. By the authority order in `AGENTS.md`, `DESIGN.md` wins, so the README lists only the fonts actually shipped. The team should correct or explain the proposal wording before judging.
- **Subset note:** latin only, which covers English and Bahasa Indonesia.

### D-010 Running TypeScript scripts without a new dependency (Hakim)

- **Decision:** `backtest`, `seed` and `icons` run with `node --experimental-strip-types`. Source rules that make this work everywhere: imports carry the `.ts` suffix; `erasableSyntaxOnly` bans enums and parameter properties; `verbatimModuleSyntax` and `allowImportingTsExtensions` are on. The same files then import cleanly under Vite, Vitest and Node.
- **Trade-off:** Node prints an experimental warning on 22.12.
- **Alternatives:** `tsx` (not approved); compiling first (extra build step).
- **Honest stubs:** `scripts/backtest.ts` and `scripts/seed.ts` print that they are not implemented and exit with code 1, so no one can mistake them for a passing step.

### D-011 CI (Sonny)

- **Decision:** `.github/workflows/ci.yml` runs on every push and pull request. Job `verify`: `npm ci`, lint, `test:coverage`, build. Job `e2e`: install Chromium, run the end-to-end tests, upload the report on failure. Read-only permissions; actions pinned to major versions.
- **Status:** written, not yet run. It needs the team to push to GitHub.
- **Alternatives:** one combined job (slower feedback); pinning actions by commit SHA (more maintenance at this stage).

### D-012 Hosting: Cloudflare Pages (Sonny, Samuel)

- **Decision:** Cloudflare Pages, as the team chose. Build command `npm run build`, output directory `dist`, Node version taken from `.nvmrc`. `public/_headers` sets no-cache on `index.html`, `sw.js` and the manifest, and long immutable caching on hashed assets and fonts.
- **No `_redirects`:** Cloudflare Pages serves single-page apps automatically when there is no top-level `404.html`, so a rewrite rule is unnecessary.
- **Status:** deployed at https://foodoo-d5h.pages.dev, connected to the GitHub repository so each push to `main` deploys. The Playwright smoke test (service worker and offline reload) passes against that URL, `sw.js` is served with `Cache-Control: no-cache`, and a deep link returns 200 (single-page fallback).

### D-013 Placeholder shell, routing and i18n baseline (Vassel, Sonny)

- **Decision:** React Router with a single `/` route. Strings live in `src/i18n/en.ts`; `src/i18n/id.ts` is typed `Record<keyof typeof en, string>`, so a missing or extra key fails the build, and a unit test also checks key parity and empty strings. Default language is English; the toggle and persistence arrive in F2.
- **Alternatives:** an i18n library (not approved).

### D-014 Styles (Vassel)

- **Decision:** `tokens.css` holds the exact tokens from `DESIGN.md`. `base.css` adds the reset, 16 px body text, the 3 px navy focus ring with 2 px offset, the pressed-button translate, 48 px minimum tap targets, and a `prefers-reduced-motion` override. `src/styles/` is not listed in the `AGENTS.md` owner table, so it is assigned to the screens owner; the team may reassign.

### D-015 Repository state (Samuel)

- **Decision:** `git init -b main` was run, with nothing staged or committed, per the team's instruction. `FOODOO_logo.png`, the abstract and proposal PDFs, and the handbook PDF were moved to `docs/brand/`, `docs/submissions/` and `docs/reference/`. No `LICENSE` file was created because the licence is the team's choice.

## Phase F0 follow-up (2026-11-25)

### D-016 Commits and remote (Samuel, Sonny)

- **Decision:** the team asked the AI to commit and gave the GitHub remote. F0 was committed in six commits grouped by module owner, authored with the repository's configured git identity and carrying a `Co-Authored-By` trailer for the AI, as `AGENTS.md` section 4 requires. `.gitattributes` forces LF line endings so Prettier checks behave the same on Windows and in CI. The branch was pushed to `origin/main`.
- **Alternative:** the owners commit by hand. Not chosen because the team asked otherwise.

## Phase F1: Domain logic and evidence (2026-11-25)

### D-017 Weekday and date conventions (Hakim)

- **Decision:** weekday is `0` for Sunday to `6` for Saturday, the JavaScript convention. Date arithmetic uses UTC so it does not depend on the device time zone. `src/domain/time.ts` validates every date and time and throws `RangeError` on bad input, so a malformed value fails loudly instead of producing a wrong suggestion.
- **Alternative:** ISO weekday (Monday is 1). Not chosen because `Date` already gives the JavaScript number.

### D-018 Arrival share uses whole minutes, so the maths is exact (Hakim)

- **Decision:** the profile weight of each opening hour is multiplied by the minutes of that hour the stall was open before time `t`. Both the arrived weight `A` and the total weight `W` are integers, and `share = A / W`. For opening hours on the hour this equals the formula in `SPEC.md` (for example `12/23` at 10:30). It also gives a correct answer if the owner opens at 06:30.
- **Rounding:** demand is `cooked x W / A` rounded half up using integer arithmetic, `floor((2 x cooked x W + A) / (2 x A))`. It gives the same result as `Math.round(x + 1e-9)` from the spec, without any floating-point correction. The `share >= 0.95` test is `20 x A >= 19 x W`. Cooked 42 sold out at 10:30 gives 80.5 exactly, which rounds to 81 as required.
- **Missing hours:** a busy-profile hour with no entry counts as normal (weight 2). If closing is not after opening, the share is 1, so the demand equals the cooked quantity and nothing divides by zero.

### D-019 `estimateDemand` returns `null` when it has no information (Hakim)

- **Decision:** with no sell-out time and no leftover, the function returns `null` instead of guessing. If both are present, the sell-out time wins. The Close screen must therefore collect one of them before a day can be closed.
- **Alternative:** throw an error, or treat a missing leftover as 0. Both would silently or loudly corrupt the history.

### D-020 Suggestion details the spec left open (Hakim)

- **Delta:** in the `history` case the delta is the suggestion minus the cooked quantity of the most recent day in the history used. In the cold-start cases it is the suggestion minus the usual quantity.
- **Observations:** `observations` is the number of days in the history that was actually used (at most 8 same-weekday days, or at most 14 days of any weekday).
- **Leftover days:** a day counts as a leftover day only if its leftover is greater than 0.
- **Critical ratio guard:** if the price is not above the salvage value, the ratio is 0.95 instead of dividing by zero or going negative. The settings screen should prevent this case.
- **Empty quantile:** throws `RangeError`. `suggestQty` never calls it with fewer than 5 values.
- **Cold-start rounding:** `ceil(base x 11 / 10)` is `floor((base x 11 + 9) / 10)` and the leftover test is `leftover x 100 > 20 x cooked`, so there is no floating point.

### D-021 Weekly metrics window (Hakim)

- **Decision:** `weeklyMetrics` takes an end date and covers that day and the six before it. Only closed, non-unusual days count, as in the proposal's metric definitions. Sell-out frequency is sell-outs divided by menu-days, lost sales sums `max(0, estimatedDemand - cookedQty)` on sold-out days, and the acceptance share is `null` when no suggestions exist, so the UI can show a dash instead of 0%.
- **Not built:** the per-menu table and chart of the weekly summary (WS-2 and WS-3). They belong to the reserved Final Day task.

### D-022 Demo generator and the true demand (Hakim)

- **Decision:** the generator follows `SPEC.md` section 7 with seed `foodoo-demo`. It takes today's date as an argument, so it never reads the clock. The true demand is returned in a separate `truth` array that the app must not store. Recorded fields (`estimatedDemand`, `demandIsEstimate`) come from `estimateDemand`, which sees only what an owner would record.
- **Unusual days:** about 10% of days are flagged unusual, but their demand is not changed, because the spec does not define a demand shock. The flag therefore only removes data in the demo.
- **Sell-out time:** as the spec says, a menu sells out at the arrival of customer number cooked + 1. The real last portion is sold one customer earlier, so the recorded sell-out time is slightly late and the estimate slightly low. The backtest limitations say so.
- **Reuse:** `drawDay`, `observeOutcome` and `toMenuDay` are exported so the backtest uses exactly the same demand model.

### D-023 Backtest design (Hakim)

- **Decision:** 3 seeds (`backtest-1` to `backtest-3`), 12 weeks each, metrics over weeks 3 to 12. Both policies face the same demand and arrival times (common random numbers), so differences come from the policy only. FOODOO sees only recorded data. Results are summed over seeds. The script writes `docs/BACKTEST.md` and replaces the block between the markers in the README, so the numbers are never typed by hand. Output contains no timestamps, so two runs give byte-identical files (checked).
- **Result as it came out:** FOODOO has fewer leftovers, fewer lost sales and higher profit than the baseline, and more sell-out menu-days (+4.3%). The estimator error is lower than "sales = demand". The worse sell-out count is reported, not hidden.
- **Likely reason sell-outs rise (not isolated by an experiment):** three of the four menus have a critical ratio below 0.5, so the rule cooks below the median demand for them, which trades some sell-outs for fewer leftovers. This is the newsvendor behaviour the proposal describes, but it has not been checked against owners.
- **Alternatives:** independent random draws per policy (noisier comparison); a tool like `tsx` to run the script (not approved).

### D-024 Windows drive-letter case and the coverage gate (Sonny)

- **Observed:** from a shell that reports the project path as `d:/...`, Vitest's V8 coverage lists every domain file twice, the second time at 0%, and the 100% gate fails although all tests pass. From `D:\...` (PowerShell, VS Code) it reports 100%.
- **Tried:** setting Vite `root` to the real path. It broke test discovery, so it was reverted.
- **Decision:** documented in the README setup section. Linux CI is not affected.

## Phase F1 review (Stage 2, 2026-11-25)

### D-025 Health check and review outcome (Hakim, Sonny)

- **Checked first:** `npm run lint`, `npm run test:coverage` (66 tests, 100% on `src/domain`), type-check of both TypeScript projects, and `npm run build` all passed before any change. Nothing was broken.
- **Reviewed:** every function in `src/domain/` against `SPEC.md` section 6, the generator against section 7, the backtest against section 8, and the metrics against section 9 and proposal section 6.1. The rounding, integer arithmetic, history selection, cold start and clamping match the spec. No T1 to T16 expected value changed.
- **Fixed:** the true demand could reach the app through the demo object (D-029), weekly metrics had no per-menu breakdown (D-030), and `estimateDemand` accepted impossible inputs (D-031). Added a diagnostic and a per-menu table to the backtest (D-032). The coverage report no longer lists `types.ts`, which holds only types and showed a misleading "0" row; the 100% gate is unchanged.

### D-026 How the generator samples arrival times (Hakim)

- **Decision:** for each customer, pick an opening hour with probability equal to its busy weight divided by the total weight, then a uniform minute inside that hour. Sort the times. Customer number cooked + 1 sets the sell-out time.
- **Why:** this is exactly the "weights per hour, even spread inside the hour" model that `arrivalShare` assumes, so the demo and the estimator describe the same world. The backtest limitations say plainly that this flatters the estimator.
- **Known gap:** an opening time that is not on the hour (for example 06:30) is not scaled by open minutes in the generator. The demo profile is on the hour, so it has no effect.

### D-027 What "delta" is compared against (Hakim)

- **Decision (unchanged from D-020, explained):** in the `history` case, delta = suggestion minus the cooked quantity of the newest day in the history actually used. With same-weekday history this is last week's same weekday, so "Sold out on 3 of the last 6 Mondays, +5" means "5 more than last Monday". With the 14-day fallback it is the most recent eligible day. In the cold-start cases it is the suggestion minus the usual quantity.
- **Alternative:** compare with yesterday. Rejected because yesterday may be a different weekday from the history the sentence talks about.

### D-028 How the backtest's FOODOO policy builds its history (Hakim)

- **Decision:** FOODOO starts with no history, like a new user, so it runs the cold-start rule at first. Weeks 1 and 2 are warm-up and are not scored. After each simulated day it stores only what the app would record: cooked, leftover, sell-out time, and the `estimateDemand` result from those. It never reads the true demand. It always cooks exactly its suggestion. Unusual days are flagged, skipped by `suggestQty`, and still scored.
- **Alternative:** start FOODOO with the 56-day demo history. Rejected because that history was made with knowledge of the generator and would hide the cold-start period.

### D-029 True demand removed from the demo history object (Hakim)

- **Decision:** `generateDemoHistory` now returns only `stallName`, `settings`, `menus`, `days` and `menuDays`, exactly what an owner could have recorded. The true demand exists only inside `drawDay`, which only the backtest script uses. A test fails if any other key appears.
- **Why:** the F2 seeder will store this object. Before, it also carried a `truth` array, so a careless seeder could have written the true demand into IndexedDB.

### D-030 Weekly metric definitions (Hakim)

- **Window:** the chosen end date and the 6 days before it, counting only closed, normal days. `SPEC.md` WS-1 says "last 7 days"; the proposal says "7 closed, normal days". The spec has higher authority, so a week with 2 unclosed days has 5 counted days, not 7 reached further back.
- **Definitions:** leftovers = sum of recorded leftovers. Sell-out frequency = menu-days with a sell-out time divided by menu-days. Estimated lost sales = sum of max(0, estimated demand minus cooked) on sold-out days. Acceptance = menu-days where cooked equals suggested, divided by menu-days that had a suggestion (`null` when there were none, so the UI shows a dash, not 0%).
- **Per menu:** `weeklyMetrics` now returns the same figures per menu in `byMenu`, as proposal section 6.1 promises ("per menu and in total"). The weekly summary screen (R1) is still untouched for Final Day.
- **Input time** is measured during owner testing, not computed by the domain.

### D-031 `estimateDemand` rejects impossible inputs (Hakim)

- **Decision:** a cooked quantity that is negative or not an integer, or a leftover outside 0 to cooked, throws `RangeError`.
- **Why:** before, leftover 15 of 10 cooked produced a demand of minus 5 that would enter the history silently. This follows D-017: bad data fails loudly. The Close screen limits the stepper to 0 to cooked anyway (CL-2).

### D-032 Backtest diagnostic and per-menu tables (Hakim)

- **Decision:** the main table stays Baseline vs FOODOO, as `SPEC.md` section 8 asks. A third policy, "FOODOO without sell-out correction", runs the same rule on the same days but records a sold-out day as demand = sales. A per-menu table shows where gains and losses come from.
- **Why:** the product's central claim is that correcting sold-out days matters. Comparing FOODOO with the same rule without the correction measures that claim directly. It is a diagnostic in the report, not a product feature.
- **What it showed:** with the correction, FOODOO loses fewer sales, sells out on fewer menu-days and makes more profit, but has clearly more leftovers than the uncorrected rule. Both are reported; the exact figures live only in the generated `docs/BACKTEST.md`. Per menu, FOODOO is ahead of Baseline on profit for all four menus but worse on some single metrics (for example more Nasi Uduk leftovers, more Ayam Goreng and Sayur Lodeh sell-outs).

### D-033 Open item for F2: reason wording on the 14-day fallback (Vassel, Sonny)

- **Problem:** the spec's text "Sold out on {n} of the last {m} {weekday}s" is wrong when `suggestQty` fell back to the latest 14 days of any weekday. The `Reason` type in `SPEC.md` section 6.1 has no field saying which history was used.
- **Not changed now:** fixing it means adding a field to a type the spec defines exactly. The team should decide before F2, for example by adding `scope: "weekday" | "recent"` to `Reason` and updating `SPEC.md`.

## Phase F2, first half (Stage 3, 2026-11-25)

### D-034 Scope and starting state (all owners)

- **Checked first:** `npm run lint`, `npm test` (70 tests) and `npm run build` passed before any change.
- **Built:** the Dexie data layer, i18n with a persisted toggle, design-system components, the app layout, and the Onboarding, Today and Settings screens. Plan, Service and Close are the next stage; their routes exist and say "Coming soon" (D-044).
- **Not started on purpose:** export and import (DM-3, DM-4) and the weekly summary. They are reserved for Final Day and are not rendered anywhere.

### D-035 How "now" reaches the screens without making the domain impure (Sonny, Hakim)

- **Decision:** a `ClockProvider` (`src/app/ClockProvider.tsx`) holds a `now()` function, `new Date()` by default. `useNow()` re-reads it every 30 seconds. `toLocalStamp(date)` (`src/app/localStamp.ts`) turns a `Date` into the local `"YYYY-MM-DD"`, `"HH:MM"` and weekday. Domain functions only ever receive those strings.
- **Why:** `AGENTS.md` bans `Date.now()` in `src/domain/`. Tests pass a fixed `now` (Monday 2 March 2026, 09:00), so the phase and the date header are deterministic. Playwright can use its own clock API in Stage 4, so the app has no test-only switch.
- **Alternatives:** read the clock inside each screen (untestable); a URL parameter to fake the time (a test hook that ships to users).
- **Local time:** the date and time come from the device's local clock, because the stall works in local time (`AGENTS.md` section 6). Domain date arithmetic stays in UTC (D-017), which is safe because it only handles date strings.

### D-036 Which phase of the day is "now" (Hakim)

- **Rule (`todayPhase` in `src/domain/phase.ts`):** day closed â†’ done. Otherwise, nothing planned for today â†’ Plan, even after closing time, so a forgotten morning can still be recorded. Otherwise, every planned menu sold out, or the time is at or after closing â†’ Close. Otherwise â†’ Service, including before opening once the plan is saved.
- **"Planned"** means at least one menu-day row exists for today, so no extra schema field is needed. Plan (Stage 4) writes those rows when the owner accepts the plan.
- **Why pure:** the rule is part of the 100% coverage gate and is easy to explain: "the app shows the first step you have not done yet, and Close once the stall is closed or empty".
- **Display:** the loop graphic fills the current segment orange, done segments navy and upcoming ones white. Below it, a list says "Done", "Now" or "Next" in words, so the state never depends on colour.

### D-037 How screens read and write data (Samuel)

- **Decision:** one `FoodooDb` instance is supplied through a React context (`DbProvider`). Screens read with live queries (`useStall`, `useMenus`, `useTodayState` in `src/db/hooks.ts`), so every screen updates by itself after a write. All writes are plain async functions in `src/db/repositories.ts` that take the database as their first argument and validate before writing.
- **Why:** repositories are unit-tested without React, and component tests give each test its own fresh database. There is no global store to keep in sync with IndexedDB.
- **Alternatives:** a state library (not approved, and it would duplicate IndexedDB); calling Dexie directly from components (validation would be spread across screens).

### D-038 Schema v1, designed for migrations (Samuel)

- **Tables:** `stall` (one row with id `"stall"`: name, settings, `setupComplete`), `menus` (key `id`), `days` (key `date`), `menuDays` (compound key `[date+menuId]`, indexes `date` and `menuId`).
- **Why a compound key:** a menu can only have one record per day, so saving the plan twice replaces it instead of duplicating it (tested).
- **Migrations:** versions live in a list, `SCHEMA_VERSIONS`, and `createDb(name, versions)` applies them. A test opens a v1 database, writes a row, reopens it with an extra v2 step, and checks that the upgrade ran. A later real migration adds one list entry and one test like that one. A second test pins the exact v1 tables and indexes, so an accidental schema change fails CI.
- **Stall name:** stored and editable in Settings (optional, at most 40 characters). The spec does not require it; it exists because the demo stall has a name, "Warung Demo".

### D-039 Demo seeding and its safety rules (Samuel, Hakim)

- **Decision:** `buildDemoRecords(today)` (`src/demo/seed.ts`) copies the generator's history into database rows field by field, listing each field by name. Anything not in the domain types is dropped, even if the generator gains a field later (tested with an injected `trueDemand` field). The true demand cannot reach the database (see also D-029).
- **Rules:** the demo can be loaded only when there is no stall or the stall is already the demo; it never overwrites an owner's own data (tested). Loading again resets the demo. Removing the demo, or deleting all data, clears every table.
- **History:** 56 days ending yesterday, relative to the device date when it is loaded, so the demo always looks current. Today starts empty, in the Plan phase.

### D-040 Input validation lives in the domain (Hakim)

- **Decision:** `validateMenu` and `validateHours` in `src/domain/setup.ts` return error codes, not text. The screens turn codes into messages through i18n, for example "Cost must be lower than price". Repositories call the same functions and refuse invalid data, so the rules hold even if a screen forgets them.
- **Rules:** name 1 to 40 characters after trimming; price a whole number of rupiah above 0; cost a whole number from 0 to below the price; leftover (salvage) value a whole number from 0 to below the price; usual portions from 1 to 999; closing time after opening on the same day.
- **Salvage below price:** this guarantees that `criticalRatio` never hits the guard in D-020.
- **Busy hours:** one cell per opening hour (`profileHours`). Changing the hours keeps the levels of hours that remain and sets new hours to normal (`resizeProfile`). A tap cycles quiet, normal, busy (`nextBusyLevel`).
- **Number entry:** a field accepts `8000`, `8.000` or `8 000`; dots and spaces are read as thousands separators, as owners write them.

### D-041 i18n design (Sonny)

- **Decision:** `translate(language, key, params)` replaces `{name}` placeholders. `useT()` returns a translator for the current language. The language lives in `localStorage` (`foodoo.language`), is read synchronously at start so the first screen is never in the wrong language, and also sets `<html lang>`. Reads and writes are wrapped so a blocked storage falls back to English.
- **Language is a device preference, not stall data,** so **Delete all data** keeps it.
- **Tests enforce:** identical keys, no empty strings, and identical placeholders in both languages.
- **Formatting:** `formatRupiah` writes `Rp 8.000` with plain integer grouping in both languages, so the output never depends on the browser's locale data. Long dates use the browser's `Intl` with `en-GB` or `id-ID`. A delta is shown as `+5`, `âˆ’3` (a true minus sign) or `0`.
- **Reason text:** `renderReason` (`src/i18n/reason.ts`) turns a stored `Reason` into the sentence from `SPEC.md` section 6.5, for every code and both scopes (D-042), in both languages. Plan uses it in Stage 4.
- **Language switch** sits in Settings and on the Welcome screen, so an owner can switch before setup starts.

### D-042 `Reason.scope` closes D-033 (Hakim)

- **Decision (approved by the team in this session):** `Reason` gains `scope: "weekday" | "recent"`. `suggestQty` sets `"weekday"` when it used the same-weekday history and `"recent"` when it fell back to the latest 14 days. A cold start is always `"recent"`. `SPEC.md` sections 6.1 and 6.5 were updated to match.
- **Effect:** "Sold out on 3 of the last 6 Mondays" is shown only when the history really is Mondays; otherwise "Sold out on 2 of the last 14 days".
- **Checked:** no quantity changes. `npm run backtest` regenerates `docs/BACKTEST.md` and the README block byte for byte (`git diff` is empty). T1 to T16 are unchanged; two tests now also check the scope.

### D-043 `fake-indexeddb` for database tests (Samuel, Sonny)

- **Decision (approved by the team in this session):** dev dependency `fake-indexeddb` 6.2.8 (Apache-2.0), loaded by `tests/setup.ts`. It gives Node an in-memory IndexedDB, so the real Dexie schema, repositories and migration test run in Vitest. It is never part of the app bundle.
- **Alternative:** test the database only through Playwright (slow, and migration tests would need a real browser).

### D-044 Unbuilt screens are visible but clearly unfinished (Vassel)

- **Decision:** the Plan, Service and Close tabs exist, so the layout and navigation can be tested now. Each tab carries a "Soon" tag, and each screen shows "Coming soon. This screen is built in the next step of the prototype." with a link back to Today.
- **Why:** `AGENTS.md` rule 3.4 requires unfinished UI to be hidden or labelled. Hiding the tabs would make the Today primary action a dead end with no explanation.

### D-045 Accessibility decisions made while building (Vassel)

- **Dialogs:** `Sheet` is a `role="dialog"` with `aria-modal`. It traps Tab, closes on Escape, moves focus to the first field and returns focus to the button that opened it. A native `<dialog>` was not used because jsdom does not support `showModal`, so it could not be component-tested.
- **Bug found by the tests:** busy-hour cells, loop steps and "Soon" tags were announced as "06:00Normal" and "PlanNow", because adjacent spans had no space between them. Explicit spaces were added, and the tests now query those buttons by the spoken name, for example "06:00 Normal".
- **Other rules applied:**
  - every input has a `<label>`; errors are linked with `aria-describedby` and marked with `aria-invalid`; the first invalid field gets focus after a failed save
  - toasts are in a polite live region
  - navigation uses `aria-current="page"`
  - one `h1` per screen and a skip link
  - 48 px minimum targets and the 3 px navy focus ring
  - orange only behind ink text; danger buttons are white on `#C1121F`
  - error borders are thicker and errors start with "!", so they do not rely on colour
- **Not done yet:** Lighthouse scores (PLAN F3 item 4).

### D-046 Logo and app icon (Vassel, Sonny)

- **Decision:**
  - `AppIcon` draws "FO / OD" with F and D as plain paths, so it renders the same without any font: F top-left, D bottom-right, one diagonal orange loop.
  - `public/icons/icon.svg` uses the same three paths, and `npm run icons` re-rendered the 192, 512 and maskable PNGs.
  - `Logo` draws "Fâˆž / DOO" using the self-hosted Rubik Mono One, with `textLength` so its width is stable while the font loads.
- **Source:** `docs/brand/FOODOO_logo.png` was used only as a visual reference; nothing was traced or embedded.
- **Known gap:** the icon SVG file and the component share the geometry by copy, not by import. Changing one means changing the other.

## Phase F2, second half (Stage 4, 2026-11-25)

### D-047 Scope and starting state (all owners)

- **Checked first:** `npm run lint`, `npm test` (149 tests) and `npm run build` passed before any change.
- **Built:**
  - the Plan, Service and Close screens
  - the "estimate" labels
  - the core-loop end-to-end test, online and offline
  - a Chromium installability check
- **Removed:** the "Coming soon" screen, the "Soon" tags and their strings, because no loop screen is unfinished any more.
- **Not started on purpose:** export and import (DM-3, DM-4) and the weekly summary stay reserved for Final Day.

### D-048 Plan and close rules live in two new pure files (Hakim)

- **Decision:**
  - `src/domain/plan.ts` holds `suggestAll` (`suggestQty` for every active menu), `isPlanQty`, `clampQty`, `isCooked` and `isPlanLocked`.
  - `src/domain/close.ts` holds `closeMenuDay`, `closeDayRecords`, `withClosedDay`, `tomorrowPlan`, `validateSoldOutTime` and `incompleteDays`.
  - Both files are under the 100% coverage gate.
- **Why:** tomorrow's suggestions appear in three places: the Close confirmation sheet, the closed Close screen, and tomorrow's Plan screen. All three call `suggestAll`, so the numbers cannot drift apart.
- **Alternative:** compute inside the screens. Rejected because the screens are not under the coverage gate and the rule would exist three times.

### D-049 Plan screen: one button whose label follows the edits (Vassel)

- **Decision:** the sticky bar shows the total and one primary button.
  - It reads **Accept all** while every card equals its suggestion, and **Save plan** once one is edited. Both save every card.
  - An edited card shows an "Edited" tag and "Suggested N", so PL-4 is visible in the UI, not only stored.
- **Why:** `DESIGN.md` asks for one primary action per screen and names both labels. Two buttons side by side would invite the wrong tap.
- **After saving:** the app returns to Today, where the loop graphic moves on to Service.
- **Stored values:** once a plan exists, a card shows the stored `suggestedQty` and reason. Re-opening the plan therefore never changes what counts as "suggested".

### D-050 When the plan is locked (Hakim)

- **Decision:** the plan can be changed while no menu is currently marked sold out today. If the only sell-out is undone, the plan opens again. A closed day is always read-only.
- **Why:** PL-5 says "until the first sell-out tap". An undone tap was a mistake, so it should not lock the owner out.
- **Enforced twice:** the screen hides the steppers, and `savePlan` refuses to write.

### D-051 A menu planned at 0 portions was not cooked (Hakim, Samuel)

- **Decision:**
  - The row is still stored, so its suggestion counts toward the "accepted without edit" metric.
  - It gets no Service tile and no Close row.
  - It is closed with leftover 0 and `estimatedDemand = null`, so it never enters the history as "nobody wanted it".
  - `summarizeDay` counts only rows with portions as planned.
- **Alternative:** do not store the row. Rejected because the suggestion would be lost.

### D-052 Close screen: leftover starts at 0, and the missed sell-out prompt defaults to closing time (Vassel, Hakim)

- **Decision:** each menu not tapped sold out starts at leftover 0. Leftover 0 shows the yellow CL-3 prompt "About what time did it run out?", already filled with the closing time. The owner usually types one or two leftovers and moves on.
- **Why closing time is safe:** a sell-out at closing gives an arrival share of 1, so demand equals cooked (an estimate). An untouched prompt can never inflate demand.
- **Storage:** a confirmed missed time is stored as `soldOutAt` with leftover 0. This is the same as a tapped sell-out, and the same as the generator's sold-out rows.
- **Validation:**
  - A sell-out time edited by the owner must lie between opening and closing time (`validateSoldOutTime`).
  - A tap during service stores the real clock time unchecked, as SV-2 requires.
- **Alternative:** start each leftover empty and require an entry. Rejected because it doubles the taps at night, against the under-one-minute target.

### D-053 Close day previews first, then writes (Samuel, Vassel)

- **Decision:**
  - **Close day** opens a sheet computed in memory by `closeDayRecords`, `withClosedDay` and `tomorrowPlan`.
  - The sheet shows how many people wanted each menu today, and tomorrow's suggestion with its reason.
  - Nothing is written until **Confirm and close day**. `closeDay` then runs the same functions in one Dexie transaction.
- **After closing:** the Close screen shows the stored result, recomputed from the database. It survives a reload, and the e2e test checks that its text equals the preview exactly.
- **Not built:** reopening a closed day, so a wrong close cannot be corrected yet. This is listed in the README limitations.

### D-054 How estimates are shown (Vassel)

- **Decision:** one component, `EstimateValue`, renders every demand.
  - An estimate reads "≈ 81 (estimate)" ("≈ 81 (perkiraan)" in Bahasa Indonesia), inside a dashed badge.
  - A counted demand is a bare number.
  - Plan numbers are labelled "suggested portions", never "demand".
- **Why:** `DESIGN.md` section 8 requires "≈ 81 (estimate)", never a bare number. The dashed border marks an estimate without relying on colour.

### D-055 Service: tap time, undo and the time edit (Vassel, Sonny)

- **Tap time:** read from the clock at the moment of the tap (`useClock().now()`), not from the 30-second tick that drives the header.
- **Undo:**
  - The toast stays 10 seconds (`UNDO_MS`). A fake-timer test checks it is still there at 9,999 ms and gone at 10,000 ms.
  - Undo sets `soldOutAt` back to `null`.
  - Tapping a second menu replaces the toast, so only the latest tap can be undone from it. Earlier taps are corrected with the time sheet.
- **Time edit (SV-4):**
  - A 500 ms long press on a sold-out tile opens the time sheet, with **Save** and **Not sold out**.
  - A visible **Edit time** button does the same, because a long press cannot be done from a keyboard (`DESIGN.md` section 7).
  - A short tap on a sold-out tile does nothing, so a second tap cannot change data by accident.

### D-056 Stepper (Vassel)

- **Behaviour:**
  - The − and + buttons step once per press. While held, they repeat after 400 ms, every 100 ms.
  - The number between them is a text input with a numeric keyboard, so a large change can be typed.
  - Values are clamped: 0 to 999 on Plan, 0 to the cooked amount on Close.
- **Implementation:** the press logic lives in `StepButton`. It steps on pointer-down and ignores the click that follows. Keyboard activation (a click with `detail = 0`) still steps once.
- **Why a separate component:**
  - The React hooks lint rule rejected timer refs used through a helper during render.
  - One component per file also follows `AGENTS.md` section 6.

### D-057 Photo slot and incomplete days (Vassel, Hakim)

- **Photo slot:** each Plan card shows a neutral square with the menu's first letter. No upload exists, because storing photos would need a schema change and is outside the abstract's scope.
- **CL-6:** Today lists past days that were planned but never closed, as "kept but not used for suggestions". `suggestQty` already ignores them because they are not closed.

### D-058 Core-loop end-to-end test (Sonny)

- **Decision:** `e2e/coreLoop.spec.ts` runs the PLAN F2 item 7 loop twice against the production build:
  - **online**
  - **offline:** first load online, wait for the service worker to control the page, cut the network, reload, then run the whole loop with no network, including the final reload
- **Determinism:**
  - Time zone `Asia/Jakarta`.
  - Playwright's `clock.setFixedTime` pins Monday 2 March 2026 at 09:00, then 10:30 for the sell-out, then 20:00 for the close.
  - Timers still run, so the real 10-second undo is used.
  - The demo history is generated relative to that date, so every number is reproducible.
- **Checked in the real UI:**
  - Nasi Uduk, cooked 42 and sold out at 10:30, shows "Wanted ≈ 81 (estimate)".
  - Ayam Goreng with leftover 3 shows cooked − 3, with no estimate label.
  - After the reload, tomorrow's four suggestions equal the preview text.
- **Screenshots** of Plan, Service, Close, the sheet and the closed day are attached to the Playwright report (not committed).

### D-059 Installability evidence (Sonny)

- **Decision:**
  - `e2e/smoke.spec.ts` asks Chromium through the DevTools protocol (`Page.getInstallabilityErrors`) and expects an empty list.
  - The existing test checks the manifest name, the display mode and the 192, 512 and maskable 512 icons.
- **Icons:** they were already rendered from `public/icons/icon.svg` in the F2 first half (D-046). The SVG did not change, so they were not re-rendered. A visual check showed the mark inside the maskable safe zone.
- **Not claimed:** installing on a physical Android phone. The team should do that once on a real device.

### D-060 Test timing on slow machines (Sonny)

- **Observed:**
  - The "Delete all data" component test sometimes failed: it waited longer than Testing Library's default of 1 second for the Welcome screen.
  - It also failed this way at the previous commit (checked in a separate worktree), so this stage did not cause it.
  - Under full-suite load with coverage, the same test also exceeded Vitest's 5-second per-test limit.
- **Decision:**
  - `tests/setup.ts` sets Testing Library's wait to 5 seconds.
  - `vite.config.ts` sets Vitest's per-test timeout to 15 seconds.
  - No assertion changed. Clearing about 280 demo rows in the in-memory IndexedDB is simply slow on this machine.

### D-061 Toast position above the action bar (Vassel)

- **Observed in the e2e screenshots:** on a phone, the toast covered the **Save plan** button for 4 seconds.
- **Decision:** when a screen has the sticky action bar, the toast sits above it. This is plain CSS (`body:has(.action-bar)`). Browsers without `:has` keep the old position, so the change is cosmetic only.

### D-062 Deployment for the semifinal (Samuel, Sonny)

- **Decision (made by the team in this session):**
  - The AI does not commit.
  - The owners review, commit and push to `main`, and Cloudflare Pages builds it.
  - The same e2e suite then runs against https://foodoo-d5h.pages.dev with `E2E_BASE_URL`.
- **Alternatives:**
  - A Wrangler direct upload. It needs the team's Cloudflare login and may be refused for a Git-connected project.
  - The AI committing to a preview branch. This breaks the no-commit instruction.

## Phase F3, product improvement (Stage 5, 2026-11-25)

### D-063 Scope and starting state (all owners)

- **Checked first:**
  - `npm run lint` passed.
  - `npm test` passed: 199 tests.
  - `npm run build` and `npm run e2e` passed: 5 tests, online and offline.
  - The F2 second half was still uncommitted, so the deployed URL still served the pre-F2 build.
- **Built:**
  - the "How FOODOO calculates" page
  - edge-case tests and one fix
  - a schema-upgrade test
  - a storage-protection status in Settings
  - route code splitting
  - a bundle budget check
  - a Lighthouse measurement script
  - a no-network end-to-end test
  - `FINAL_DAY.md`
- **Not done, on purpose:**
  - **PLAN F3 item 1 (owner-testing fixes).** The team had no findings from owner tests or interviews yet, so nothing was fixed. Nothing was invented in its place. R3 depends on these findings (see `FINAL_DAY.md`).
  - R1, R2 and R3 are not started or scaffolded. The `final-day-start` tag was not created.

### D-064 "How FOODOO calculates" is computed by the real rules (Hakim, Vassel)

- **Decision:** `workedExample()` in `src/domain/explain.ts` runs the same functions the app uses:
  - `arrivalWeights` and `estimateDemand` give the example "sold out at 10:30 → about 52% had arrived → about 81 wanted it" (`DESIGN.md` 5.8)
  - `criticalRatio` and `suggestQty`, over five closed Mondays, give the suggestion 34 and its reason line
- **Why:** a judge or an owner can check the logic from the UI, and the page cannot drift from the code. A test pins 52, 81 and 34 and checks them against `arrivalShare`, `estimateDemand` and `quantile` directly. The file is under the 100% coverage gate.
- **Example data:**
  - It uses the `SPEC.md` 6.6 reference profile and the demo Nasi Uduk prices.
  - It is labelled "Example stall. These numbers are an example, not your data." It is never mixed with the owner's data.
- **Plain language:**
  - Suggestions are explained as "enough on about 44 of every 100 past days", weighed against "Rp 3.500 earned per extra sale, Rp 4.500 lost per leftover".
  - The words "quantile" and "critical ratio" do not appear (`DESIGN.md` 8).
- **Access:**
  - Route `/how` is outside the stall guard, so the page works before setup and offline.
  - It is linked from Settings → About and from the Close summary ("How is this worked out?").
- **Small refactor:** `DEMAND_CAP_FACTOR` is exported from `estimate.ts`, so the page shows the same 3× cap the estimator uses.

### D-065 Data survives an app update (Samuel)

- **Decision:** `tests/db/migration.test.ts` uses the real repositories to build a version-1 database:
  - load the demo
  - plan a day, tap a sell-out, close the day
  - reopen the database with an extra version-2 step that adds an index
  - check that every row of every table is deep-equal before and after, and that the new index works
  - a second case reopens the same version, as after a service-worker update, and checks nothing changes
- **Why:** a PWA update ships new code against old IndexedDB data, and the owner's history must survive it. D-038 only proved that an upgrade step runs; this test proves the data is untouched.
- **How a real migration is added:** one new entry in `SCHEMA_VERSIONS`, plus one test like this one that fills v1 data first.

### D-066 Edge cases (Hakim, Vassel)

- **Tested** in `tests/screens/edgeCases.test.tsx`:
  - no menus
  - all menus archived, before and after today's plan
  - a day left unclosed
  - the clock past closing time, with and without a plan
- **Found and fixed:** when every menu was archived, the Close summary showed the heading "Tomorrow's suggestions" over an empty list. It now says "No active menus. Add or restore a menu in Settings."
- **Checked and kept as is:**
  - A menu archived after today's plan still appears on Service and Close, so the day can be closed.
  - Past closing time with no plan, Today still offers the plan, so a forgotten morning can be recorded (D-036).
  - A tap during service after closing time stores the real time (D-052).
- **Known edge, documented, not changed:** a plan where every menu is set to 0 portions leaves nothing to serve or close, so Today stays on Plan. That day is not counted as incomplete, because nothing was cooked (D-051).

### D-067 Storage protection is visible in Settings (Samuel, Vassel)

- **Decision:** Settings → Data reads `navigator.storage.persisted()` and shows one of three states:
  - "Protected"
  - "Not protected yet"
  - "This browser does not say"
- While unprotected, a **Keep my data** button asks the browser again. A toast reports the browser's answer, including a refusal.
- **Why:** DM-5 was already requested after setup and after loading the demo. But Chrome often refuses until the app is installed or used often, and the owner could not see that. Telling the owner is better than silently hoping.
- **Pure part:** `getStorageStatus` in `src/db/repositories.ts`, unit-tested with stubs.

### D-068 Bundle budget check (Sonny)

- **Decision:** `npm run size` (`scripts/bundleSize.ts`) gzips every JavaScript file in `dist/assets` with Node's zlib and fails above 250 KB, the PLAN F3 budget. It also prints CSS and the service-worker files. CI runs it after the build.
- **Why:** a number checked on every push stays true; a number in a README does not. No dependency was added.

### D-069 Faster first load: code splitting, and what did not help (Sonny, Vassel)

- **Code splitting:**
  - Every screen except Welcome is now loaded on demand (`React.lazy` in `src/app/App.tsx`), and so is the demo seed (`loadDemo` imports it dynamically).
  - The entry chunk went from 115.9 KB to about 104.6 KB gzip.
  - The service worker precaches every chunk, so offline use is unchanged. The offline e2e run navigates through every lazy screen with the network cut.
- **Splash:** the loading state is now the logo and the value line instead of a bare "Loading…" (`src/components/Splash.tsx`), with the loading message kept for screen readers.
- **Tried and reverted:** removing the font preload. On cold mobile runs LCP did not improve (2.04 s), and FCP got worse (1.79 s against 1.65 s).
- **Result (Lighthouse 12.8.2, cold first visit, mobile simulated Slow 4G and 4× CPU slowdown, 3 runs):**
  - first contentful paint 1.49 s
  - largest contentful paint 2.03 to 2.05 s
  - The PLAN F3 target "first load < 2 s" is met by first paint and **missed by about 30 to 50 ms** on largest contentful paint. This is reported as missed.
  - The remaining time is mostly running React, the router and Dexie on the slowed CPU.

### D-070 How accessibility and performance are measured (Sonny, Vassel)

- **Decision:** `npm run lighthouse` (`scripts/lighthouse.ts`) runs Lighthouse 12.8.2 with `npx`, against `npm run preview`. It covers:
  - a cold first visit
  - Today, Plan, Service and the How page, after loading the demo and saving a plan
  - the mobile and desktop presets for each
- It writes `docs/LIGHTHOUSE.md` and README section 12, so no score is typed by hand.
- **Why `npx` and not a dependency:** the team chose this in the session. Lighthouse is a measurement tool, not part of the app, and it is listed in the README's third-party table.
- **How the demo state reaches Lighthouse:**
  - The script starts Playwright's Chromium with a fixed profile and a debugging port, seeds the demo through `connectOverCDP`, and Lighthouse attaches with `--port` and `--disable-storage-reset`.
  - A guard fails the run if a page redirects to Welcome. This guard caught an earlier attempt, where Lighthouse's launcher silently used its own empty profile.
- **Result on 2026-11-25:**
  - Accessibility 100 and Best practices 100 on every measured page, mobile and desktop. No failed audit.
  - Mobile performance 95 to 99; desktop 100.
  - The warm rows are repeat visits served by the service worker; the cold row is the first-visit figure.
  - This meets `DESIGN.md` section 7 (≥ 95).
- **Environment note:** the C: drive of the measuring laptop was full. The npm cache and temporary files for this run were pointed at `D:\try\.foodoo-measure`, outside the repository. This does not change any measured value.

### D-071 Local fallback is proven by tests, not only documented (Sonny)

- **Decision:** `e2e/noNetwork.spec.ts`:
  - routes every request and aborts any that is not to the local server
  - walks Welcome, demo, Plan, Service, Close, How and Settings
  - asserts that the list of blocked requests is empty and that the self-hosted Space Grotesk face loaded
- **Clean-copy check:** the working tree, without `node_modules` and `dist`, was copied to a new folder, then:
  - `npm ci` and `npm run build` succeeded
  - `npm run preview` ran on port 4174
  - the full e2e suite passed against it (6 of 6)
- **Not done:** turning the laptop's network adapter off; that is for the team to rehearse (`FINAL_DAY.md` section 5).

### D-072 Final Day preparation (all owners)

- **Decision:** `FINAL_DAY.md` holds:
  - the feature list with evidence
  - the unfinished items, including owner testing
  - R1 to R3 completion plans, with owner, files, tests and a time box
  - the session timeline
  - the setup checklist
  - the exact tag and cutoff commands
  - the local fallback steps
- **R3:** blocked until real owner findings exist; if there are none, it stays Not started rather than being invented.
- **PLAN section 5:** only items verified in this session are ticked:
  - the deployed URL smoke test passed on its current, older build
  - no secrets in history (scan of file names and contents)
  - README sections
  - `FINAL_DAY.md`
- **Left unticked:**
  - the clean-machine offline run, because the network adapter was not switched off
  - the tag
  - the member review

### D-073 Visual style changed from soft neo-brutalism to clean and formal (Vassel)

- **Decision:** the team agreed to replace the soft neo-brutalist look with a clean, formal one:
  - 1 px neutral grey borders instead of 3 px black outlines
  - no offset shadows; a soft shadow only on layers that float (toast, sheet, sticky action bar)
  - radii of 6 to 8 px instead of 10 to 14 px; neutral grey page background (`#F5F6F8`) instead of cream
  - navy primary buttons with white text instead of orange; orange kept as a status accent (current phase, sold out)
  - pale tints (`--navy-soft`, `--amber-soft`, `--orange-soft`, `--info-soft`) instead of solid yellow and sky blocks
  - no rotated stickers or stamps, no dashed borders, no "pressed" translate; feedback is a colour change
  - numbers in Space Grotesk with tabular figures; Rubik Mono One kept for the logo wordmark only (`--font-brand`)
- **Alternatives considered:** keeping neo-brutalism (bold and high-contrast, but read as playful rather than trustworthy for a planning tool); a UI kit such as Material (ruled out by AGENTS.md section 2, and it would hide the token system); a system font stack (saves a file, but changes the look on every device and the offline font test expects Space Grotesk).
- **How it was done:** only `src/styles/` changed, plus one font token in `Logo.tsx` and the manifest `background_color`. Every class name stayed the same, so no screen or test changed. The opening paragraph and sections 2, 4, 5 and 7 of `DESIGN.md` now describe the new style.
- **Evidence:**
  - contrast computed for every new text and background pair; the lowest is dark orange on light orange, 5.21:1 (target 4.5:1)
  - Lighthouse rerun on the new build: Accessibility and Best practices 100 on every measured page, mobile and desktop (`docs/LIGHTHOUSE.md`)
  - lint, 28 of 28 unit test files, build and 6 of 6 e2e tests pass
- **Environment note:** the C: drive of the measuring laptop is full, which crashes Vitest's default process pool (`ERR_IPC_CHANNEL_CLOSED`). Unit tests were run with `--pool=threads`, and Playwright and Lighthouse with temporary files on `D:\try\.foodoo-measure`. Free space on C: before running `npm test` as normal.

### D-074 Logo and app icon rebuilt to match the team's brand sheet (Vassel, Sonny)

- **Decision:** the logo and app icon now follow `docs/brand/FOODOO_logo.png` closely, replacing the D-046 approximation:
  - the sheet was measured in pixels (letter boxes, loop extents, stroke thickness) and mapped into each mark's coordinate space
  - one infinity curve (`BRAND_LOOP` in `AppIcon.tsx`, four cubic Bézier segments per lobe pair) was fitted to the measured centre line; the largest error is about 1 px in the 512 icon space. The logo uses it scaled by 0.9415; the icon uses it rotated by −45°. Stroke 50 in both, as on the sheet
  - the letters are Rubik Mono One glyph outlines converted to SVG paths with the measured scale: in the logo F is narrowed and DOO widened, as on the sheet; in the icon F and D keep near-natural width
  - Rubik Mono One is therefore no longer loaded at runtime: its `@font-face`, its token and the woff2 file were removed. The OFL licence text stays, because the outlines come from it
  - `public/icons/icon.svg` uses the same paths, and `npm run icons` re-rendered the 192, 512 and maskable PNGs. The maskable mark stays inside the safe zone
- **Alternatives considered:** keeping `<text>` with `textLength` (D-046), which distorted the glyphs and depended on the font loading; embedding the PNG (blurry at small sizes, heavier, and not themeable); tracing the PNG automatically (rough edges and a heavy path).
- **Not copied:** the sheet's "PLAN · SELL · RECORD" line and labels belong to the presentation card, not to the mark, so they are not part of `Logo`.
- **Evidence:** a side-by-side render against the sheet; lint, 28 of 28 unit test files and 6 of 6 e2e tests pass.

### D-075 Original colours restored on the clean style (Vassel)

- **Decision:** the team kept the thin-border, flat, small-radius style of D-073 but asked for the original colours exactly. Every element now has its earlier fill and text colour: cream page, orange primary buttons, current phase, sold-out tiles and busy cells with ink text; navy done states and toast; yellow sticker, active tab, selected options, edited tag, prompts and notices; sky info notes, step pill and estimate label. The pale tints and dark-orange text from D-073 were removed.
- **What stays from D-073:** 1 px grey borders, no offset shadows, no rotation or press translate, 6 to 8 px radii, Space Grotesk numbers.
- **Accessibility:** these are the colour pairs that already scored 100 in the earlier Lighthouse runs; ink on orange is above 4.5:1.

### D-076 Landing page replaces the small welcome card (Vassel, Sonny)

- **Decision:** a new user opening FOODOO now sees a scrolling landing page, not a small card. It has six parts: a top bar with a small logo and the language switch, then a cream hero with the headline, the start and demo buttons side by side on wider screens, and three pills, three problem cards, the four-step daily loop, an example card, four reasons FOODOO is different, and a closing call to action. Users who have finished setup still go straight to Today. Settings links to `/about`, which shows the same page with a "Back to the app" button, for demos to judges.
- **No invented numbers:** the example card shows `workedExample()` values from `src/domain/explain.ts`, labelled "Example", and the demand uses the "estimate" label. The page has no user counts, testimonials or typed-in backtest figures.
- **Alternatives considered:** a separate marketing site, which would need network access and a second deploy; a page that shows every time, which would slow the stall owner's morning routine.
- **Evidence:** lint passes, 28 of 28 unit test files pass, and 7 of 7 e2e tests pass. The new e2e test checks the section headings and confirms there is no horizontal scroll at 360 px.

### D-077 Figure-8 graphic removed from Today; landing top bar compacted (Vassel)

- **Decision:** the figure-8 drawing above the phase steps on Today was removed. Team review found it hard to read: the right loop was split into Service (top) and Close (bottom) with no arrows, and it repeated the three step boxes below it. `LoopProgress` now shows only the Plan, Service and Close boxes with Done, Now and Next. The figure-8 stays in the logo.
- **Landing layout:** the logo is smaller and shares one row with a compact language switch. Its legend and radio dots are hidden visually but stay available to screen readers and the keyboard. The hero content is centred. No content was added.
- **Alternatives considered:** a linear Plan → Service → Close arrow strip (it would still repeat the boxes); keeping the drawing as a brand element (it was not understood).

### D-078 Leftover must be entered before a day can close (Vassel, Hakim)

- **Problem:** on Close, every leftover stepper started at 0. A menu that was not sold out but had leftover 0 was stored as a missed sell-out at closing time. If the owner pressed Close day without counting, every menu was recorded as sold out, and the next suggestions rose.
- **Decision:** the leftover now starts empty (shown as "?"). Close day is blocked, with an error on each empty row and a summary line, until every cooked menu that was not tapped sold out has a leftover. The missed sell-out prompt appears only after the owner enters 0. In the stepper, minus on an empty value gives 0 and plus gives 1. In the domain, `closeMenuDay` now refuses a cooked menu with neither a leftover nor a sell-out time, and `missingLeftovers` lists the rows still to count.
- **Alternatives considered:** keeping 0 and showing a warning when every menu is 0 (it misses the case where only some rows were skipped); a single "nothing left" confirmation (it adds a step without fixing skipped rows).

### D-079 A past day that was never closed can be closed later (Vassel, Samuel)

- **Problem:** CL-6 listed unclosed days on Today, but the only way to close a day was on that same day. Forgetting to close meant losing the day's data for suggestions.
- **Decision:** each date in the "Days not closed" card links to `/close/:date`. That route only accepts a past date that is planned and still open (`incompleteDays`); any other date goes back to Today, and today's date goes to `/close`. The screen says which day is being closed, and the confirmation sheet does not show tomorrow's suggestions, because they belong to a different day. After confirming, the app returns to Today and the day is used for suggestions from then on.
- **Alternatives considered:** a date picker on Close (it lets the owner pick days with no plan); closing old days automatically with no leftovers (that invents data).

### D-080 Stalls that close after midnight (Hakim)

- **Problem:** `validateHours` refused a closing time earlier than the opening time, so a night stall (for example 18:00 to 02:00) could not use the app.
- **Decision:** any closing time different from the opening time is valid. When closing is earlier than opening, the stall day spans midnight. The stall day then rolls over halfway between closing and opening (`rolloverMinute`; 10:00 for an 18:00 to 02:00 stall). A time before the rollover belongs to the previous date (`stallDate`), and its minute counts after midnight (`dayMinute`, +1440). The estimator, the sold-out time check, the Today phase and the busy-hour list all use these helpers. For stalls that close the same day, the rollover is midnight and every result is unchanged. `npm run backtest` reproduces `docs/BACKTEST.md` exactly. Screens get the stall date from `useStallStamp`.
- **Why halfway:** the stall is closed then, so no sale or sell-out can fall on the wrong side. Rolling over at midnight would split one night across two dates. Rolling over at the opening time would leave the owner no time to plan before opening.
- **Alternatives considered:** documenting it as a limitation only.

### D-081 Confirm a sell-out tapped in the first 30 minutes (Vassel, Hakim)

- **Problem:** a sell-out at the opening minute gives the estimator almost no arrivals, so the demand estimate jumps to the 3x cap. One accidental tap early in the day would push that menu's suggestions up for weeks.
- **Decision:** a tap before opening or in the first 30 minutes (`isEarlySellOut`, `EARLY_SELL_OUT_MINUTES = 30`) opens a confirmation sheet that explains the effect; Cancel stores nothing. Later taps are stored right away as before. The estimator is unchanged, so backtest results stay the same.
- **Alternatives considered:** a softer cap inside `estimateDemand` (changes every estimate and the backtest, and still accepts the mistake); ignoring early taps (loses real early sell-outs).

### D-082 Four demo stalls, chosen by an environment setting (Hakim, Vassel)

- **Problem:** the single demo stall only shows a morning stall with long history. Judges and owners could not see how FOODOO behaves for a lunch stall, a night stall or a stall that has just opened, and the team wanted a build with no demo at all for real owner testing.
- **Decision:** the generator takes a scenario object (seed, hours, busy profile, menus, hidden mean demand, weekday factors, history length, unusual-day chance, owner jitter). Scenario 1 is the existing Warung Demo, unchanged. Scenarios 2 to 4 are an office lunch stall (weekday-scope suggestions), a night stall from 18:00 to 02:00 (D-080 rollover), and a stall with 4 days of history (cold-start up and down, a salvage value). `VITE_DEMO_SCENARIO` picks `off` or `1` to `4` at build time; `off` hides the demo buttons on Welcome and in Settings. An invalid value fails the build. `npm run seed` writes `docs/DEMO_SCENARIOS.md` from the generator, so the documented numbers cannot drift.
- **Kept identical:** the arrival sampler now works in stall-day minutes so a night stall can be generated; for a same-day stall it makes the same random draws, so scenario 1 data and `docs/BACKTEST.md` are byte-identical (checked by `npm run backtest` and a test).
- **Tests always use scenario 1:** Vitest and the Playwright build pin `VITE_DEMO_SCENARIO=1`, so a developer's `.env` cannot change test results. A separate test mocks the setting to `off`.
- **Alternatives considered:** a scenario picker inside the app (more UI and strings; the team asked for an environment switch); a runtime URL parameter (anyone could change it on the deployed site); random history per load (not reproducible).

### D-083 Weekly summary and export/import built before Final Day (Hakim)

- **Decision:** at the team's request (Hakim, 2026-11-25), the weekly summary (R1, WS) and export/import (R2, DM-3/4) were built now instead of on Final Day. Owners asked for numbers on Today, a way to see earlier days, and spreadsheet files.
- **Consequence:** this overrides `AGENTS.md` section 5 for R1 and R2. They no longer count as Final Day progress. The team must choose replacement Final Day tasks; none were invented. UX-FIX (R3) stays reserved. `PLAN.md`, `FINAL_DAY.md` and the README say so.
- **Alternatives considered:** keeping them for Final Day (protects the Final Day score but leaves owners without history or backup for three weeks).

### D-084 Analytics on Today and a History screen (Hakim)

- **Decision:** Today shows a "Last 7 days" card with `weeklyMetrics`: leftover portions, sell-outs, estimated lost sales (always labelled estimate) and plans accepted as suggested. A new History tab adds the per-menu table, a cooked vs demand chart for one menu, and a list of every past day that opens a read-only day view.
- **Pure helpers:** `menuTotals`, `menuSeries`, `pastDays`, `dayRows` and `soldPortions` live in `src/domain/metrics.ts` and share `countedDates` with `weeklyMetrics`: only closed, usual days in the last 7 days count, the same rule the suggestion uses. Sold portions are the cooked count on a sold-out day, otherwise cooked minus leftover. Domain coverage stays at 100%.
- **Chart:** inline SVG with no library. Estimated demand is drawn as a dashed outline so it is never mistaken for measured demand; a visually hidden table gives the same numbers to screen readers.
- **Alternatives considered:** a chart library (bundle size, and it hides the design system); showing the full table on Today (too much for a one-glance screen).

### D-085 Export and import in JSON, CSV and XLSX (Hakim)

- **Model:** every format maps to one `Backup` object (`format`, `formatVersion`, `schemaVersion`, `exportedAt`, stall, menus, days, menuDays).
  - JSON is the backup itself.
  - XLSX holds the same data in four sheets (Stall, Menus, Days, MenuDays); text, numbers and booleans are real cell types.
  - CSV is one row per menu per day with the day fields repeated. It starts with a UTF-8 byte-order mark so Excel shows the text correctly, and the reader accepts both comma and semicolon, because Excel in the Indonesian locale saves with semicolons.
- **Import rules:** JSON and XLSX replace all data, in one Dexie transaction, after a confirmation. CSV holds no stall or menu settings, so it only adds or updates menu-days for menus that already exist; an unknown menu is an error. Every field goes through the same rules as setup (`validateMenu`, `validateHours`, busy profile matching the hours) plus date, time, weekday and range checks; leftover cannot exceed cooked. Nothing is written unless the whole file is valid. Up to 20 problems are listed with their place (for example `menus[2].cost`). Values a spreadsheet app rewrites are accepted: `TRUE`/`1` for true and a time stored as a day fraction (0.4375 is 10:30).
- **Where:** Settings → Data (export and import) and the Welcome screen (import only), because after **Delete all data** the app returns to Welcome.
- **Alternatives considered:** CSV import that creates menus (too easy to create wrong menus from a hand-edited file); importing without confirmation (a wrong file would erase the stall).

### D-086 XLSX and ZIP written without a library (Hakim)

- **Decision:** `src/db/zip.ts` writes and reads ZIP files, and `src/db/xlsx.ts` writes and reads the minimal SpreadsheetML parts. Compression uses the browser's built-in `CompressionStream("deflate-raw")` and `DecompressionStream`. Reading supports the shared-string tables, rich text and missing cells that Excel and Google Sheets write. The code is loaded only when export or import runs.
- **Why:** the plan was to add `fflate` (MIT), but the npm registry could not be reached from the build machine, and `AGENTS.md` asks to avoid new dependencies. A hand-written codec adds no dependency, and the team can explain every byte of it. The main bundle stays at 146.2 KB gzip, within the 250 KB budget.
- **Limits:** no ZIP64 (files over 4 GB), formulas are not recalculated, and import needs `DecompressionStream` (Chrome 103+, Safari 16.4+, Firefox 113+).
- **Alternatives considered:** SheetJS (its current builds are not published on npm); exceljs (large); `fflate` (fine, but the registry could not be reached).

### D-087 Layout pass on Today, History and the day view (Hakim)

- **Problem:** in team review the new screens were hard to read. "≈ 57 (estimate)" wrapped into a large highlighted block. The per-menu table was cut off on a phone. The chart stopped halfway on desktop, its date labels were oversized, and it had no numbers. The past-day list was a column of underlined links. The day view title wrapped onto two lines.
- **Decision:**
  - Estimates show `≈ N` with a small "estimate" tag under the number (`EstimateNumber`).
  - The weekly tiles sit in a card with a "See history" link in its heading row. They form a 2-column grid on phones (an odd last tile spans the row) and an auto-fit grid on desktop. "Today so far" uses three equal columns.
  - The table is compact enough to fit 360 px and carries a note that demand on sold-out days is an estimate.
  - The chart is HTML bars with the value above each bar, so the text stays a readable size at any width. Menu chips replace the dropdown.
  - Past days are rows with a coloured status badge and an arrow.
  - The day view has a short title, a summary card with the full date, and a four-number strip (cooked, sold, leftover, demand) per menu.
  - In Settings, the export and import blocks have full-width separators and three equal format options.
- **Alternatives considered:** keeping the SVG chart with a fixed aspect ratio (text scales with width); a horizontal-scrolling table (hides columns on phones).

### D-088 Demo stalls are chosen in the app and always dated to today (Hakim, Vassel)

- **Problem:** with D-082, each build offered one demo stall picked by a number in `.env`, so a judge saw only one of the four. A demo loaded on one day kept its dates, so opening it days later showed a history that ended days ago.
- **Decision:** **Try demo stall** opens a sheet with the four stalls; each card shows the name, hours, history length and a one-line description in English and Bahasa Indonesia. Settings has **Reset demo data** (same stall) and **Choose another demo stall**. The stall row stores `demo: { scenario, generatedFor }`. `useDemoRefresh`, mounted in the main layout, compares `generatedFor` with the current stall date and, on a new day, regenerates the same scenario (`refreshDemo`) and shows "Demo dates moved up to today". The setting became `VITE_DEMO=on/off`. A night stall picked at 09:00 is dated to the evening before, matching D-080.
- **Export and import:** the `demo` marker is an optional field in the JSON backup and an optional `demo` column in XLSX, validated on import (scenario 1 to 4, a real date, demo stalls only). Older backups without it still import; such a demo is never regenerated, so imported data is not overwritten.
- **Trade-off:** regenerating on a new day replaces anything tried in the demo on earlier days. The team chose this so the demo always looks current.
- **Kept identical:** scenario data, `docs/BACKTEST.md` and the `docs/DEMO_SCENARIOS.md` numbers are unchanged. The picker uses a small catalog (`src/demo/catalog.ts`), so the history generator still loads only when a stall is chosen. A test keeps the catalog equal to the scenarios.
- **Alternatives considered:** keeping the `.env` number (one stall per build); shifting stored dates instead of regenerating (weekday-dependent demand would no longer match the weekday); a URL parameter (changeable by anyone on the deployed site).

### D-089 Import on the first screen is one button with a modal (Vassel)

- **Problem:** the first screen showed the whole import block (heading, explanation, file button) under **Start setup** and **Try demo stall**. It broke the hero layout and read as a third, heavier section.
- **Decision:** the first screen shows **Import a file** as a third button in the same row (three columns from 720 px, stacked on phones). It opens a modal with the explanation and **Choose a file to import**; after a valid file is read, the modal closes and the existing "Import this file?" confirmation opens. Settings keeps the full export and import panel. Sheets now align their text to the start, so modals opened from the centred landing page no longer inherit centred text.
- **Alternatives considered:** a text link under the buttons (easy to miss for an owner restoring a backup); keeping the block but collapsing it (still a separate section).

### D-090 Statistical proof of the estimator and policy lives in the unit tests (Hakim)

- **Problem:** `docs/BACKTEST.md` reports the estimator and policy results, but a script run is not a regression test. A change to `estimateDemand` or `suggestQty` could silently break those claims while `npm test` stayed green.
- **Decision:** `tests/domain/simulation.test.ts` simulates 20 seeds of 120 days for every menu of all four demo scenarios (3 of 4 menus per scenario sell out on 30% of days or more and get the bias assertions; profit is compared per whole stall, with salvage counted). It reuses the generator's own `drawDay`, `observeOutcome` and `toMenuDay`, so the observation model matches the product. It asserts that the sell-out rate is above 30%, that the corrected estimator's aggregate bias is within 10% of true demand, that the naive "sales = demand" bias is below -10%, and that FOODOO profit is at least the cook-the-usual-quantity profit. A second block runs 1000 random cases on the estimator invariants and on the suggestion range.
- **Measured at the time of writing (not typed from a report):** sell-out rate 85.8%, corrected bias -0.14%, naive bias -27.7%, profit Rp 321,368,000 (usual) vs Rp 369,010,000 (FOODOO). No threshold was loosened.
- **Also:** added `typecheck` and `check` scripts. `CLAUDE.md` describes an older layout (`src/engine`, `docs/SPEC.md`, `docs/PROGRESS.md`); `AGENTS.md` outranks it, so those paths were not created.
- **Scope:** `src/domain/` is the engine, as `AGENTS.md` requires. No `src/engine/` or `src/synthetic/` folder was created, because that would duplicate the existing code.
- **Alternatives considered:** a second engine folder (duplicates logic and breaks the layout rule); asserting on `docs/BACKTEST.md` (generated file, 3 seeds only).

### D-091 Register mode and sales-linked close (stage 3; Vassel, Hakim, Samuel)

- **Problem:** the owner asked for a register that records what sold and feeds the estimator. `SPEC.md` section 5.9 listed per-transaction sales recording as out of scope, and `AGENTS.md` says not to add or replace what the abstract promises. The stage brief also named files and sections that do not exist (`docs/SPEC.md`, `docs/PROGRESS.md`, "section 11", and the names `DayRecord.plannedQty`, `yesterday_soldout`).
- **Decision:** the team lifted the exclusion. `SPEC.md` section 5.9 no longer excludes per-transaction recording and section 5.10 (RG, SO, SM, CL-7 to CL-11, TP-1) holds the requirements. The brief's names map to the repo's: `plannedQty` is `cookedQty`, the engine's sold is `cookedQty - leftover`, `yesterday_soldout` is the existing reason code `cold-start-up` (its text now ends with the change in portions, for example "sold out last time → +4"). `docs/PROGRESS.md` is replaced by the status tables in `PLAN.md` and the README.
- **Optional by design:** `StallSettings.mode` is `simple` (default) or `pos`. Simple mode keeps the one-tap Service screen and needs no `Sale` row. Switching modes never deletes sales.
- **Data:** Dexie schema v2 adds a `sales` table (`id, date, groupId`). `MenuDay.soldOutSource` is `manual`, `auto_pos` or `unknown_time`. Older v1 databases upgrade without changing any row.
- **Atomic sale:** `recordSale` writes all lines under one `groupId` and any automatic sell-out marks in one Dexie transaction; any invalid line writes nothing. The screen passes the date and time read at the moment of payment, so a sale cannot land on a day that has no plan.
- **Sell-out rules:** a sale that brings stock to 0 sets `soldOutAt` to the sale time with source `auto_pos`, only if no time exists yet. Voiding the last transaction removes an `auto_pos` mark when stock returns and keeps a manual mark. Selling beyond the plan is allowed and shown as "over plan"; the engine keeps the first time stock hit 0.
- **Night:** leftover is prefilled with the register's remaining stock; a different number shows a neutral note with both numbers and the difference. Leftover 0 without a time asks for the time, with "Don't remember" (closing time, source `unknown_time`, so demand equals cooked). "Some left over" cancels a sell-out mark. A closed day can be corrected for 7 days (`canCorrect`); re-closing re-estimates demand and tomorrow's suggestion.
- **Revenue:** pos mode sums `qty x unitPrice` of the day's sales; simple mode uses `(cooked - leftover) x price`. The unit price is copied into each sale, so later price edits do not change history.
- **Plan lock:** once a sale exists the plan cannot be edited, as after a sell-out tap.
- **Not done, on purpose:** sales and mode are not in the JSON, CSV or XLSX export, and a replacing import clears them (recorded in the README limitations). Real payments, receipts and ingredients are out of scope. Today does not show register totals; the Register and the close summary do.
- **Tests:** `tests/domain/pos.test.ts`, `tests/db/pos.test.ts`, `tests/screens/register.test.tsx`, `tests/screens/closePos.test.tsx`, `tests/screens/taps.test.tsx` (TP-1) and `tests/integration/twoDays.test.tsx`.
- **Alternatives considered:** storing a running `sold` counter on the menu-day (breaks when a sale is voided); a separate engine path for pos mode (two sources of truth); hard-coding pos mode (forces a register on stalls that do not want one).

### D-092 Vercel deploy configuration and install workaround (Sonny)

- **Problem:** the team wants the app deployable on Vercel as well as Cloudflare Pages. A single-page app needs a rewrite so a deep link such as `/plan` does not return 404, and the service worker and `index.html` must never be cached, or an update would not reach installed phones.
- **Decision:** `vercel.json` sets the Vite framework preset, `npm ci`, `npm run build`, output `dist`, one rewrite of every path to `/index.html` (files that exist are served first, so assets and `sw.js` are unaffected) and the same cache rules as `public/_headers`. It adds `nosniff` and `no-referrer`. No dependency was added.
- **Install note:** on this machine `registry.npmjs.org` was unreachable, so `npm ci --registry=https://registry.npmmirror.com` was used. `package-lock.json` keeps its integrity hashes, so every package was still verified. The machine runs Node 24 while `engines` pins Node 22, so `--engine-strict=false` was needed there. Vercel uses Node 22, which satisfies `engines`.
- **Not done:** no deployment was made, because that needs the owner's Vercel login or token.
- **Alternatives considered:** deploying from `vercel --prod` without a file (rewrites and headers would live only in the dashboard and be lost); removing `public/_headers` (Cloudflare still uses it).

### D-093 UI refinement pass: tokens, targets, layout, motion, tests (Sonny, Vassel)

- **Scope:** polish of the existing screens only. No new screen, no new feature, no change to the engine or the data model. The brief named files that do not exist here (`docs/SPEC.md`, `docs/DESIGN.md`, `docs/PROGRESS.md`, "section 11/12"), as in D-091; the repository's `SPEC.md`, `DESIGN.md` and `AGENTS.md` were followed. Tokens stay in `src/styles/tokens.css` (the `AGENTS.md` layout), not `src/app/`.
- **Type scale (tokens):** every `font-size` in `src/styles/` now uses `--text-xs` 12, `--text-sm` 14, `--text-md` 16, `--text-lg` 20, `--text-xl` 24, `--text-2xl` 32, `--text-num` 28 or `--text-hero` 44. Sizes below the 12 px minimum (10 and 11 px: chart values, the estimate tag) became 12 px. 13 px became 14 px. 18 px became 20 px (tile names, panel headings, landing lead, cart total). 30 px became 32 px.
- **Motion tokens:** `--dur-fast` 120 ms, `--dur-base` 160 ms, `--dur-slow` 240 ms, `--ease-std`, `--ease-out`. Only `transform`, `opacity`, colour and border colour are animated. `prefers-reduced-motion` removes transitions and animations, and now also the view-transition animation.
- **Other tokens:** `--scrim`, `--radius-xs`, `--tap-min` (48 px). The only colours still written as literals outside `tokens.css` are the logo and app-icon fills in `Logo.tsx` and `AppIcon.tsx`, which are brand artwork that is also rendered to PNG by `scripts/makeIcons.ts`.
- **`--line-strong` darkened** from `#8c959f` to `#7f8993`. The old value was 2.73:1 on the cream page, below the 3:1 that WCAG 1.4.11 asks of component borders. The new value is 3.20:1 on cream and 3.56:1 on white. `npm run contrast` (`scripts/checkContrast.ts`) checks 18 text and border pairs from `tokens.css`.
- **Fonts:** the self-hosted Space Grotesk subset in `public/fonts/` (21.8 KB, preloaded) stays. `@fontsource-variable` was not added: it would duplicate the font already shipped, add a dependency, and `DESIGN.md` says the font lives in `public/fonts/`. A fallback face, `Space Grotesk Fallback` (local Arial with `size-adjust: 108%`), limits layout shift while the font loads. The 108% comes from measuring the width of one sample string in Chromium: Space Grotesk was 1.082 times Arial at weight 500 and 1.023 at 700.
- **Touch targets and small screens:** the "See history" link was 40 px high and is now 48 px. The tab bar overflowed a 320 px screen by 5 px; its grid is now `minmax(0, 1fr)` with less side padding. `viewport-fit=cover` plus `env(safe-area-inset-*)` keep the tab bar, toast, action bar and screen edges clear of notches.
- **Register on desktop:** at 1024 px and wider the Register shows the menu tiles on the left and today's sales on the right (sticky); below that it is one column as before. Same components and behaviour.
- **Navigation:** each screen sets `document.title` to "Screen name · FOODOO"; after a link navigation the page scrolls to the top and focus moves to the `h1`, so screen readers announce the new page. Tab and sidebar links use the View Transitions API when the browser has it and the user has not asked for reduced motion (opacity cross-fade of 160 ms); otherwise the change is instant. No animation library.
- **New dependency (dev only):** `jest-axe` 10.0.0 (MIT) with `@types/jest-axe` 3.5.9, requested by the team, for `tests/a11y/axe.test.tsx`. It brings `axe-core` 4.10.2 (MPL-2.0). The test fails on any serious or critical violation on nine screens and includes a control case that must be flagged. The `color-contrast` rule is off there because jsdom has no layout; contrast is checked by `npm run contrast` and by the runtime scan in `scripts/uiShots.ts`.
- **Measurement tools added:** `scripts/uiShots.ts` (`npm run ui:shots -- docs/ui/after`) captures every screen and state at 360x640, 390x844, 768x1024, 1280x800 and 1440x900 (and 320x640 with `--with-320`) and records horizontal scroll, targets under 48 px, font sizes, clipped elements and low-contrast text.
- **Not done, on purpose:** no dark mode, no UI or animation library, no new copy rewrite (the Bahasa Indonesia strings were read and left as they are).
- **Alternatives considered:** adding `@fontsource-variable` (see above); `scripts/check-contrast.mjs` (renamed `checkContrast.ts` to follow the naming rule and header convention); animating routes with a library (rejected by the brief and the bundle budget); raising `--line` instead of `--line-strong` (it is only used for quiet dividers).

### D-094 Modern look, motion and large-text layout (Sonny, Vassel)

- **Request:** make the UI more professional, modern and animated without a large rework (2026-11-26). Same screens, features, engine and data model.
- **Look:** card radius 8 to 14 px and control radius 6 to 10 px; one soft card shadow (`--shadow-card`); round yellow menu initials; the active mobile tab is a yellow pill behind the icon. Colours are unchanged. `DESIGN.md` sections 2 and 4 were updated to match.
- **Loop graphic:** `DESIGN.md` 5.2 asks for an infinity loop split into Plan, Service and Close; the app only had three boxes. The loop reuses the logo path (`BRAND_LOOP`), mirrored so Plan is on the left. The text list under it stays and carries the meaning; the drawing is hidden from screen readers.
- **Motion:** all in `src/styles/motion.css`, CSS only, `transform` and `opacity`, inside `prefers-reduced-motion: no-preference`. This replaces the old rule "colour change only, never movement". The landing hero only moves and never starts transparent, so it does not delay the largest paint. The stock bar now shrinks with `scaleX` instead of `width`.
- **Large text:** type tokens are now `rem`, so the browser's text size setting works. To stop sideways scrolling at 320 px with 200% text: words may break when they cannot fit, fixed column counts became `auto-fit`, the header wraps, and below 360 px the header drops the app icon. Tables and the estimate tag only break words when their panel is narrower than the text needs.
- **Bug fixed:** `/history` scrolled sideways (478 px wide on a 320 to 390 px phone) because a visually hidden table ignores `width: 1px`. The table now sits inside a hidden `div`. `scripts/uiShots.ts` had missed it: on a mobile viewport it compared against `window.innerWidth`, which grows with the page. It now compares against the configured width. `e2e/layout.spec.ts` guards this in both languages at 100% and 200% text.
- **Test stability:** unit tests failed intermittently with timeouts on a busy machine (different tests each time). Vitest now uses half the CPU cores (`maxWorkers: "50%"`). No assertion or timeout was changed.
- **Measurements:** `npm run lighthouse` now also records layout shift; `npm run ui:shots` disables animations while capturing.
- **Alternatives considered:** an animation library (rejected: bundle budget and not needed); exit animations for sheets and toasts (rejected: they delay unmounting); scroll-triggered reveals on the landing page (rejected: content could stay invisible in captures and older browsers); capping text growth with `min()` everywhere (rejected: it defeats the user's text size; used only for the five tab labels).

### D-095 Full redesign of the company page and the app screens (Vassel, Sonny)

- **Request:** redesign the company profile page and every demo screen to a presentable, production-like level, with freedom to change layout and colours, and fix visual and functional faults (2026-11-26). No change to the engine, the data model, the dependencies or the abstract's features.
- **Palette:** navy `#003049` and orange `#F77F00` from the logo stay. The saturated cream page and the yellow, sky and mint accents became a warm off-white page, white cards and four status tints with dark text. Why: several competing background colours made the numbers harder to scan. `npm run contrast` now checks 34 pairs; all pass.
- **Landing page:** rebuilt as a company profile with a sticky header, anchor navigation, a menu on phones, the problem, the loop, one sold-out dish followed to the next day, the differences, the four demo stalls, the team and a footer.
- **Interactive example:** "When did it sell out?" calls `estimateDemand` and `arrivalShare` on the example stall, so the numbers cannot drift from the app. It is badged "Example". Why: it shows the core idea (sold-out hides demand) in a few seconds.
- **Team section:** names and areas are taken from `AGENTS.md` section 4. The team should confirm it wants them on the public page.
- **App shell:** dark sidebar on wide screens, floating tab bar on phones, a navy Today card that says what to do next, a two-column How page, one visual language for badges, dialogs, forms and empty states.
- **Faults fixed:** opening the company page from Settings kept the old scroll position and tab title; the page behind a dialog could still scroll; hour labels on the How page broke mid-word on phones; the register's cash field had no styling; the How page read "Suggested 34 suggested portions"; "Ready to work offline." could replace a newer message, including the one with **Undo** (now it only shows when no message is visible, with a test).
- **Motion:** scroll-driven reveals on the landing page, which D-094 rejected, are now used with `translate` only inside `@supports`, so content is never invisible. Background blurs and a looping highlight were tried and removed to keep rendering cheap on low-end phones.
- **Measured on this build:** 399 unit tests and 13 e2e tests pass; axe in Chromium reports 0 violations over 64 page states (both languages, 360 and 1280 px, colour contrast on); 150 screenshots show no sideways scrolling, clipped elements or low-contrast text; page JavaScript 154.2 to 157.9 KB gzip, CSS 6.6 to 9.9 KB gzip. Cold load of `/` at 390 px with 150 ms latency, 1.6 Mbps and 4x CPU slowdown, median of 5: first paint 1180 to 1204 ms, largest paint 1252 to 1316 ms, layout shift 0.0000 in both. The axe and timing scripts are one-off Playwright scripts that are not in the repository.
- **Not done:** Lighthouse was not re-run (`registry.npmjs.org` timed out and a mirror needs the owner's approval). No physical phone. The screenshots in `docs/ui/` still show the earlier design.
- **Alternatives considered:** a restyle of tokens only (would not fix the landing page structure); a second font (needs a download and a licence entry for a small gain); a UI or animation library (not allowed by `AGENTS.md`).

## Quality pass (2026-11-26)

### D-096 Three small features built from data already stored (Vassel, Hakim)

- **Request:** evaluate the whole app, add useful features and improve the design (2026-11-26). The abstract's loop is unchanged; nothing it promises was removed or replaced.
- **Money view:** the problem statement is about wasted money, but the app only counted portions. Plan shows cooking cost and possible sales; the weekly summary shows money lost on leftovers and margin missed (estimate). Rules are in `src/domain/money.ts`, 100% covered. Prices are the current ones, which the screen says. Alternative: copy cost and price into each menu-day (needs a schema change and leaves old days without values).
- **Cooking list:** whoever cooks is often not whoever holds the phone. Today lists the day's menus and shares them with the Web Share API, falling back to the clipboard. No dependency, no server, only on a tap. Alternative: a WhatsApp link (assumes one app and puts the data in a URL).
- **Navigation cues:** a "now" marker on the current step, progress on Service and Close, and section links in Settings.
- **Reserved work:** none of this is the reserved UX-FIX, which still waits for owner testing. If the team meant any of these as the replacement Final Day tasks R1' or R2', they are now built early and should not be chosen again.
- **Not built, recommended instead:** install button, backup reminder, dark mode (already rejected in D-093), menu photos, per-event notes for unusual days.

### D-097 Bugs found by review, each with a regression test (Samuel, Vassel, Sonny)

- **Backup lost data:** JSON and XLSX export skipped register sales, and import dropped the sales mode and the sell-out source. All three are now optional fields, so older backups still import. `formatVersion` stays 1 because the change only adds fields. Alternative: version 2 (an older app would refuse every new backup).
- **Typed values moved to another day:** `/close` and `/close/:date` reused one component, so leftovers typed for a past day appeared on today. Close and Plan are now keyed by date.
- **Stale date after sleep:** the clock now re-reads when the page becomes visible, not only on its 30 s timer.
- **Scrolling changed numbers:** a +/- button stepped on touch down, so a scroll that started on it changed the value. Touch now steps on release or after a long press; mouse and keyboard are unchanged.
- **Installed app locked to portrait:** `orientation` was removed from the manifest so tablets and landscape phones work.
- **Hidden file input:** it could receive keyboard focus; it now uses `hidden`.
- **Found while testing:** navigation called `matchMedia` even without View Transitions; the order of the two checks was swapped.

### D-098 Visual refinement without new colours or libraries (Vassel, Sonny)

- **Look:** the D-095 palette stays. Navy and orange surfaces gained quiet gradients, shadows are layered, radii are slightly tighter, the header stays on screen while scrolling, and the Undo toast shows its remaining time.
- **Small screens:** short landscape screens get a one-row tab bar, a static header and a lower action bar; below 400 px the date, sticker and Plan totals are smaller.
- **Motion:** still CSS only and off under reduced motion.
- **Checked:** unit and e2e tests; a one-off axe scan in Chromium (66 states, both languages, 360x740, 740x360 and 1280x800) with no violations; `scripts/uiShots.ts` at six sizes with no sideways scroll, clipped elements or low-contrast text. Lighthouse 12.8.2 was run again on this build: accessibility 100 and best practices 100 on every row, performance 98 or higher, cold mobile largest contentful paint 2.05 s (target 2 s, missed). Not checked: physical devices, Safari, Firefox.
- **Alternatives considered:** a dark theme (doubles the states to verify five days before the semifinal); a UI or animation library (not allowed by `AGENTS.md`).

### D-099 First-run tutorial and hourly simulation (Vassel, Hakim, Sonny)

- **Request:** a spotlight tutorial on first open, and a repeating hour-by-hour simulation with demand analysis.
- **Tutorial:** own component (`Tour.tsx`) with four shaded panels around the target, so the target stays clickable without a library. Steps are data (`tourSteps.ts`). A step that changes data waits for the result (sold-out mark, closed day), not just the click. An open dialog is spotlighted instead. "Seen" is one `localStorage` key. Alternative: a tour library (new dependency).
- **Simulation:** reuses the generator's demand model, `suggestQty` and `estimateDemand`, seeded per date, and lives in memory. Alternative: write simulated sales into the register tables; rejected because repeating days would put future dates into the stored history.
- **Menu analysis:** ranks existing menus by profit per day and names the pattern. It does not propose new dishes, which the abstract does not promise.
- **Scope:** both features go beyond the abstract's core loop and need the team's confirmation. The abstract's "+1 turned away" tap is still missing.
- **Bug fixed:** choosing a demo moment on the company page could land on Today, because the page redirected before the navigation. It no longer redirects while the demo is opening.
- **Checks:** unit and e2e tests, including a first-visitor walk through all 16 steps. Not checked: physical devices, Safari, Firefox, Lighthouse.
