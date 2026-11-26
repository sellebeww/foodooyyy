# FOODOO

Daily portion planning that counts the customers a sold-out menu hides.

Team **Calon Mantu Idaman** (Samuel Matthew, Vassel Goleyu, Hakim Ulinnuha, Sonny Ferdinand), STACK 2026 by GDGoC ITB, Case 2: Stronger Communities and Everyday Services.

## 1. Overview

- **Problem.** Small food stalls (_warung_) decide portions by feel. Leftovers waste money; sold-out menus hide how many people wanted to buy.
- **Users.** Warung owners on an Android phone, often with little mobile data and a few seconds at a time.
- **Core loop.** Setup once (menus, prices, costs, busy hours) → each morning accept or edit suggested portions, each with a reason → during service tap when a menu sells out (or ring up sales in the optional Register mode) → at night enter leftovers and confirm missed sell-out times. FOODOO then estimates true demand on sold-out days and suggests tomorrow's portions.
- **Rules only.** Deterministic TypeScript. No AI or ML model inside the product. Works offline, English and Bahasa Indonesia.

## 2. Feature status

Single source of truth is `PLAN.md` section 4. Acceptance criteria are in `SPEC.md`; evidence per feature is in `docs/DECISIONS.md` and `tests/`.

| ID       | Feature                                                            | Priority | Status                 |
| -------- | ------------------------------------------------------------------ | -------- | ---------------------- |
| ON       | Onboarding and setup                                               | Core     | Done                   |
| TD       | Today screen (loop view)                                           | Core     | Done                   |
| PL       | Morning plan with reasons                                          | Core     | Done                   |
| SV       | Service: one-tap sold out + undo                                   | Core     | Done                   |
| CL       | Night close + missed sell-out + unusual day                        | Core     | Done                   |
| EST      | Demand estimation + suggestion logic                               | Core     | Done                   |
| DEMO     | Demo stall generator + labels                                      | Core     | Done                   |
| PWA      | Offline + installable                                              | Core     | Done                   |
| I18N     | English / Bahasa Indonesia                                         | Core     | Done                   |
| DM-1/2/5 | Delete all, demo load/remove, persistent storage                   | Core     | Done                   |
| BT       | Backtest report                                                    | Core     | Done                   |
| WS       | Weekly summary + history                                           | Should   | Done                   |
| DM-3/4   | Export / import                                                    | Should   | Done                   |
| REG      | Register mode, auto sell-out, sales-linked close, 7-day correction | Should   | Done                   |
| UX-FIX   | Top usability fix from owner testing                               | Should   | Reserved for Final Day |

Allowed status values: `Not started`, `In progress`, `Done`, `Reserved for Final Day`, `Simulated` (works on demo data only).

## 3. Setup

- **Environment:** Node.js 22.12.0 or a later 22.x (`.nvmrc`), npm 10+. Chrome, Edge, Firefox, Safari (e2e on Chromium only).
- **Install and run:** `npm ci`, then `npm run dev`.
- **Checks:** `npm run check` (types, lint, unit tests, build). `npm run e2e` runs Playwright (once: `npx playwright install chromium`).
- **Other scripts:** `npm run backtest` (rewrites `docs/BACKTEST.md` and section 11), `npm run seed`, `npm run size`, `npm run lighthouse`.
- **Demo switch:** `VITE_DEMO=off` in `.env` (copy `.env.example`) hides the demo stalls; the value is fixed at build time.
- **Dependencies:** pinned exactly, listed with licences in section 7.

## 4. Demo access

- **URL:** https://foodoo-d5h.pages.dev (Cloudflare Pages, from `main`; it shows the last pushed commit).
- **Vercel:** `vercel.json` is committed (Vite preset, `npm ci`, `npm run build`, output `dist`, single-page rewrite, cache headers that match `public/_headers`). Import the repository in Vercel, or run `vercel --prod`. No environment variable is required; set `VITE_DEMO=off` only to hide the demo stalls. A Vercel URL is not recorded here until a deployment exists.
- **Load demo data:** first screen → **Try demo stall** → pick one of four made-up stalls (synthetic history from a fixed seed). Every screen shows a yellow **Demo data** sticker.
- **Reset:** Settings → Data → **Reset demo data**, **Choose another demo stall**, or **Remove demo stall**. Dates always follow today.
- **Register mode:** Settings → Sales mode → Register, then plan today and open the Sales tab.
- Demo data cannot be loaded over the owner's own data.

## 5. Local fallback

```
npm ci
npm run build
npm run preview   # http://localhost:4173
```

Fonts and icons are self-hosted and there is no backend, so after install nothing needs the internet; after the first load the service worker also works with no server. Verified by `e2e/noNetwork.spec.ts` (all external requests blocked) and `e2e/coreLoop.spec.ts` (online and offline). Not done: a run with the laptop's network adapter switched off; rehearse it before the Final Day (`FINAL_DAY.md`).

## 6. Data and privacy

- No account, server, backend or analytics. No customer data.
- Stall data stays on the device in IndexedDB (`foodoo`, via Dexie): stall settings, menus, per-day plans, sell-outs, leftovers and, in Register mode, sales (menu, quantity, price, payment label).
- The language choice is kept in `localStorage` (`foodoo.language`) and survives **Delete all data**.
- Settings → Data: **Delete all data** (with confirmation), **Export** (JSON, CSV, XLSX; saved on the device only) and **Import** (validated before anything is written).
- The app asks the browser for persistent storage; the browser may refuse and Settings shows its answer.
- No API keys or credentials exist in this project.

## 7. Third-party resources

Licences read from each package's `package.json` and font licence file.

| Resource                                                       | Version        | Use                                                                            | Licence                   |
| -------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------ | ------------------------- |
| react, react-dom                                               | 18.3.1         | UI                                                                             | MIT                       |
| react-router-dom                                               | 6.30.6         | Routing                                                                        | MIT                       |
| dexie                                                          | 4.4.7          | IndexedDB storage                                                              | Apache-2.0                |
| dexie-react-hooks                                              | 4.4.0          | Live queries in screens                                                        | Apache-2.0                |
| vite-plugin-pwa                                                | 2.0.0          | Service worker and manifest                                                    | MIT                       |
| workbox-build, workbox-window                                  | 7.4.1          | Required peer dependencies of vite-plugin-pwa                                  | MIT                       |
| seedrandom                                                     | 3.0.5          | Deterministic demo data generator and backtest                                 | MIT                       |
| vite                                                           | 7.3.8          | Build tool                                                                     | MIT                       |
| @vitejs/plugin-react                                           | 5.2.0          | React support for Vite                                                         | MIT                       |
| typescript                                                     | 5.9.3          | Language                                                                       | Apache-2.0                |
| vitest, @vitest/coverage-v8                                    | 3.2.7          | Unit tests and coverage                                                        | MIT                       |
| jsdom                                                          | 28.1.0         | DOM for unit tests                                                             | MIT                       |
| fake-indexeddb                                                 | 6.2.8          | In-memory IndexedDB for unit tests (dev only)                                  | Apache-2.0                |
| @testing-library/react, @testing-library/dom                   | 16.3.3, 10.4.2 | Component tests                                                                | MIT                       |
| @playwright/test                                               | 1.65.1         | End-to-end tests and icon rendering                                            | Apache-2.0                |
| eslint, @eslint/js                                             | 9.39.5         | Linting                                                                        | MIT                       |
| typescript-eslint                                              | 8.55.0         | TypeScript lint rules                                                          | MIT                       |
| eslint-plugin-react-hooks                                      | 7.1.1          | Hooks lint rules                                                               | MIT                       |
| globals                                                        | 17.14.0        | Lint environment globals                                                       | MIT                       |
| prettier                                                       | 3.10.1         | Formatting                                                                     | MIT                       |
| jest-axe, axe-core                                             | 10.0.0, 4.10.2 | Accessibility checks in component tests (dev only)                             | MIT, MPL-2.0              |
| @types/react, @types/react-dom, @types/node, @types/seedrandom | see lockfile   | Type definitions                                                               | MIT                       |
| lighthouse (run with `npx`, not installed)                     | 12.8.2         | Measurement only (`npm run lighthouse`); not part of the app or `package.json` | Apache-2.0                |
| Space Grotesk (latin subset, self-hosted)                      | v22            | UI typeface, `public/fonts/`                                                   | SIL Open Font License 1.1 |
| Rubik Mono One (glyph outlines F, D, O)                        | v20            | Logo and app-icon letters, converted to SVG paths; font not loaded at runtime  | SIL Open Font License 1.1 |

ZIP, XLSX and CSV handling are written for this project (no library; browser `CompressionStream`). UI icons, logo and PWA icons were drawn for this project as SVG. Licence of this project: **pending team decision** (no `LICENSE` file yet).

## 8. AI assistance

Material AI assistance is disclosed here. The team owns and must be able to explain every module.

| Date       | Tool                            | Module                                                                                                                                                                                                                                                    | What the AI did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Reviewed by                                                             |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 2026-11-25 | Claude Code (Claude Sonnet 5.5) | Foundation: platform, config, styles, docs (F0)                                                                                                                                                                                                           | Wrote the project scaffold, build and lint configuration, test setup, CI workflow, PWA baseline, design tokens, placeholder shell, i18n baseline, README skeleton and decision log; downloaded the fonts; chose and pinned dependency versions.                                                                                                                                                                                                                                                                                                | Pending owner review                                                    |
| 2026-11-25 | Claude Code (Claude Sonnet 5.5) | Domain logic, demo generator, backtest, scripts (F1)                                                                                                                                                                                                      | Wrote `src/domain/` (types, time, estimate, suggest, metrics), the unit tests for cases T1 to T16 and edge cases, `src/demo/generator.ts`, `scripts/backtest.ts` and the generated `docs/BACKTEST.md`; made the F0 commits and pushed them at the team's request.                                                                                                                                                                                                                                                                              | Pending owner review                                                    |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | F1 review: domain, demo generator, backtest, coverage config                                                                                                                                                                                              | Re-ran the health checks; reviewed the F1 code against the spec and proposal; removed true demand from the demo history object; added per-menu weekly metrics and input validation to `estimateDemand` with tests; added the "without sell-out correction" diagnostic and per-menu tables to the backtest; excluded the type-only file from the coverage report; wrote decisions D-025 to D-033. Committed at the team's request after the CHECKPOINT F1 approval; not pushed.                                                                 | Team (approved at CHECKPOINT F1, 2026-11-25)                            |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | F2 first half: data layer, i18n, app shell, components, Onboarding, Today, Settings                                                                                                                                                                       | Wrote `src/db/` (Dexie schema v1, repositories, hooks) and `src/demo/seed.ts`; `src/domain/phase.ts` and `setup.ts`; added `Reason.scope` (resolves D-033); wrote the i18n provider, formatters and reason rendering; the app shell, layout, clock and toast providers; the shared components, icons, logo and app icon; the Welcome, setup, Today, Settings and "Coming soon" screens; unit, component and e2e tests; decisions D-034 to D-046. Committed by the team as `4200c18`, `a3b9231`, `c60ee4a`, `bf53e19`, `60e9e41`.               | Pending owner review (Samuel, Vassel, Sonny, Hakim)                     |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | F2 second half: Plan, Service, Close, PWA proof, core-loop e2e (CHECKPOINT F2)                                                                                                                                                                            | Wrote `src/domain/plan.ts` and `close.ts` with tests; the `savePlan`, `setSoldOut`, `closeDay` and `getHistory` repositories with tests; the Plan, Service and Close screens and their components (stepper, service tile, time sheet, close row, close summary, estimate label); the CL-6 notice on Today; the English and Bahasa Indonesia strings; the core-loop Playwright test (online and offline) and the installability check; raised test wait limits; removed the "Coming soon" scaffolding; decisions D-047 to D-062. Not committed. | Pending owner review (Hakim, Samuel, Vassel, Sonny)                     |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | F3 product improvement: domain explain, db hardening, How page, storage status, performance, measurement, local fallback, Final Day plan (CHECKPOINT F3)                                                                                                  | Wrote `src/domain/explain.ts` and the "How FOODOO calculates" screen with tests; the schema-upgrade and edge-case tests and the empty-tomorrow fix in the Close summary; the storage-protection status and its tests; route code splitting and the splash; `scripts/bundleSize.ts` (`npm run size`, added to CI) and `scripts/lighthouse.ts` (`npm run lighthouse`), and ran both; `e2e/noNetwork.spec.ts`; `FINAL_DAY.md`; decisions D-063 to D-072. Did not build R1 to R3 or create the `final-day-start` tag. Not committed.               | Pending owner review (Hakim, Samuel, Vassel, Sonny)                     |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Visual restyle: `src/styles/`, `DESIGN.md`                                                                                                                                                                                                                | At the team's request, replaced the soft neo-brutalist style with a clean, formal one (thin borders, flat surfaces, navy primary, orange as a status accent); kept every class name; updated `DESIGN.md`; checked contrast; reran Lighthouse; decision D-073. Not committed.                                                                                                                                                                                                                                                                   | Pending owner review (Vassel)                                           |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Logo and app icon: `Logo.tsx`, `AppIcon.tsx`, `public/icons/`                                                                                                                                                                                             | At the team's request, rebuilt the logo and app icon to match `docs/brand/FOODOO_logo.png`: measured the sheet, fitted one shared infinity curve, converted Rubik Mono One letters to paths, re-rendered the PWA icons, stopped loading Rubik Mono One at runtime; decision D-074. Not committed.                                                                                                                                                                                                                                              | Pending owner review (Vassel, Sonny)                                    |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Colours: `src/styles/`, `DESIGN.md`                                                                                                                                                                                                                       | At the team's request, restored the original colour use element by element (cream, orange, navy, yellow, sky) while keeping the thin-border flat style; decision D-075. Not committed.                                                                                                                                                                                                                                                                                                                                                         | Pending owner review (Vassel)                                           |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Landing page: `src/screens/Welcome.tsx`, `src/components/`, `src/i18n/`, `e2e/`                                                                                                                                                                           | Proposed and built the landing page that new users see first, with EN and ID copy, new icons, an `/about` route and tests; decision D-076. Not committed.                                                                                                                                                                                                                                                                                                                                                                                      | Pending owner review (Vassel)                                           |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Data-correctness fixes: `src/domain/`, `src/screens/`, `src/components/`, `src/app/`, `src/i18n/`, tests, e2e                                                                                                                                             | Found and fixed four issues at the team's request: an unfilled leftover was stored as a sell-out at closing time; past unclosed days could not be closed; stalls closing after midnight were refused; a sell-out tapped right after opening was stored without a check. Added tests; decisions D-078 to D-081. Not committed.                                                                                                                                                                                                                  | Pending owner review (Hakim, Vassel)                                    |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Demo scenarios: `src/demo/`, `src/app/demoConfig.ts`, `src/screens/Welcome.tsx`, `src/screens/Settings.tsx`, `scripts/seed.ts`, config, tests                                                                                                             | At the team's request, added three more synthetic demo stalls (office lunch, night stall, new stall) and the `VITE_DEMO_SCENARIO` setting (`off`, 1 to 4); made `npm run seed` write `docs/DEMO_SCENARIOS.md`; kept scenario 1 and the backtest byte-identical; added tests; decision D-082. Not committed.                                                                                                                                                                                                                                    | Pending owner review (Hakim, Vassel)                                    |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | History, analytics and export/import: `src/domain/metrics.ts`, `src/db/` (exportImport, csv, xlsx, zip), `src/screens/` (Today, History, DayDetail, Settings, Welcome), `src/components/`, `src/i18n/`, tests, e2e                                        | At the team's request, built WS and DM-3/4 before the Final Day tag: last-7-days metrics on Today; the History screen (per-menu table, cooked vs demand chart, past-day list) and a read-only day view; export to JSON, CSV and XLSX and import from all three with full validation, on Settings and Welcome; a dependency-free ZIP/XLSX codec; unit, component and e2e tests; updated SPEC, DESIGN, PLAN, FINAL_DAY and this README; decisions D-083 to D-086; then a layout pass on these screens after team review (D-087). Not committed.  | Pending owner review (Hakim, assigned by the team for all of this work) |
| 2026-11-25 | Claude Code (Claude Opus 5.5)   | Demo stall picker: `src/demo/catalog.ts`, `src/components/DemoPicker.tsx`, `src/app/useDemoRefresh.ts`, `src/db/`, `src/screens/Welcome.tsx`, `src/screens/Settings.tsx`, `src/i18n/`, tests, e2e                                                         | At the team's request, replaced the build-time scenario number with an in-app choice of the four demo stalls (EN and ID descriptions), moved demo dates to the current day on each new day, reduced the setting to `VITE_DEMO=on/off`, carried the demo marker through export and import (D-088); made import on the first screen a button beside Start setup and Try demo stall that opens a modal (D-089). Not committed.                                                                                                                    | Pending owner review (Hakim, Vassel)                                    |
| 2026-11-25 | Claude Code (Claude Sonnet 5.5) | Domain tests: `tests/domain/simulation.test.ts`, `package.json` scripts                                                                                                                                                                                   | Added a simulation test (4 demo scenarios, every menu, 20 seeds x 120 days) for estimator bias and FOODOO profit, plus a 1000-case fuzz of the estimator and suggestion range; added `typecheck` and `check` scripts; decision D-090. Did not change any formula. Not committed.                                                                                                                                                                                                                                                               | Pending owner review (Hakim)                                            |
| 2026-11-25 | Claude Code (Claude Sonnet 5.5) | Stage 3: register mode and sales-linked close (`src/domain/pos.ts`, `src/db/`, `src/screens/Register.tsx`, Close, Settings)                                                                                                                               | At the owner's request, wrote the SPEC section 5.10 change, the Sale type and schema v2, `recordSale`, `voidLastSale`, mode switch and 7-day correction in the repositories; the Register screen, cart sheet, tile and sale list; the Close changes (prefill, neutral note, Don't remember, Some left over, correction); the reason text with numbers; unit, database, screen, tap-count and two-day integration tests; decision D-091. Not committed.                                                                                         | Pending owner review (Vassel, Hakim, Samuel)                            |
| 2026-11-25 | Claude Code (Claude Sonnet 5.5) | UI refinement and deploy setup: `src/styles/`, `src/components/Screen.tsx`, `NavList.tsx`, `src/screens/Register.tsx`, `src/app/viewTransition.ts`, `scripts/` (uiShots, checkContrast, lighthouse fix), `tests/a11y/`, `vercel.json`, `docs/UI_AUDIT.md` | Restored the dev environment (installed through a mirror), added type, motion and size tokens, fixed targets, 320 px overflow and one border contrast, added safe-area handling, page titles and focus, view transitions, a two-panel Register on desktop, jest-axe tests, a contrast checker, a screenshot and measurement script, `vercel.json`; fixed a stale step in `scripts/lighthouse.ts`; measured before and after; decisions D-092 and D-093. No feature or engine change. Not committed.                                            | Pending owner review (Vassel, Sonny)                                    |
| 2026-11-26 | Claude Code (Claude Sonnet 5.5) | Local run check: `scripts/backtest.ts`                                                                                                                                                                                                                    | Installed dependencies with Node 22.16.0 through a registry mirror, ran the dev server, `npm run check` and `npm run e2e`, opened the main screens of the four demo stalls; restored the missing path header line. No behaviour change. Not committed.                                                                                                                                                                                                                                                                                         | Pending owner review                                                    |
| 2026-11-26 | Claude Code (Claude Sonnet 5.5) | UI polish: `src/styles/`, `LoopProgress.tsx`, `CookedDemandChart.tsx`, `RegisterTile.tsx`, `scripts/` (uiShots, lighthouse), `e2e/layout.spec.ts`, `tests/`, `vite.config.ts`, docs                                                                       | Softer modern styling, CSS motion, the Today loop graphic, large-text layout, a fix for sideways scrolling on History, a test worker limit, new tests and screenshots (D-094). Not committed.                                                                                                                                                                                                                                                                                                                                                  | Pending owner review                                                    |
| 2026-11-26 | Claude Code (Claude Sonnet 5.5) | Redesign: `src/styles/`, `src/screens/`, `src/components/`, `src/app/` (toast, screen arrival), `src/i18n/`, `scripts/checkContrast.ts`, `index.html`, `vite.config.ts`, `tests/app/toast.test.tsx`, `DESIGN.md`, docs                                    | New palette, company profile page with an interactive example, restyled app screens, motion, and fixes found in browser checks (D-095). Not committed.                                                                                                                                                                                                                                                                                                                                                                                         | Pending owner review                                                    |
| 2026-11-26 | Claude Code (Claude Sonnet 5.5) | CI fix: `tests/domain/pos.test.ts`                                                                                                                                                                                                                        | Added one test for the two uncovered fallback branches in `src/domain/pos.ts`, which had failed the 100% branch coverage threshold. No behaviour change. Committed and pushed at the team's request.                                                                                                                                                                                                                                                                                                                                           | Pending owner review (Hakim)                                            |

## 9. Known limitations

- Not tested with real warung owners; ON-5 (setup under 3 minutes) and the under-one-minute daily input target are untimed. UX-FIX is reserved for the Final Day.
- All backtest and demo figures are simulated; they show how the rules behave under stated assumptions, not benefit to real stalls (`docs/BACKTEST.md`).
- Register mode (D-091): cash and QRIS are labels only (no payments, receipts or ingredients). Sales and the sales mode are not in the export, and a replacing import removes them and resets the mode to simple. Only the latest transaction of a day can be voided.
- A closed day can be corrected for 7 days; after that it is read-only.
- Export/import: XLSX/CSV have no formatting; formulas are not recalculated; CSV import only updates days of existing menus; import needs `DecompressionStream` (Chrome 103+, Safari 16.4+, Firefox 113+).
- Night stalls (closing after midnight) are covered by domain and unit tests only, not by an end-to-end test or an owner.
- The Undo toast covers only the latest sell-out tap. Menu cards have no photos.
- A plan with every menu at 0 portions cannot be closed (D-066).
- Installability was checked with Chromium's report only, not on a physical phone. Only Chromium is covered by e2e.
- Lighthouse numbers (section 12) come from one machine with simulated throttling; cold-start LCP is about 2 s on simulated Slow 4G (D-069).
- Those Lighthouse numbers were measured before the 2026-11-26 restyle (D-094) and redesign (D-095) and have not been re-run; see `docs/UI_AUDIT.md` section 8 and D-095 in `docs/DECISIONS.md`.
- The screenshots in `docs/ui/` show the design from before D-095.
- The deployed site serves the last pushed commit, so it may lag this branch.

## 10. Final Day log

To be filled in on the Final Day (16 December 2026).

| Item                  | Value |
| --------------------- | ----- |
| Starting commit       |       |
| `final-day-start` tag |       |
| Final commit          |       |
| Changes in session    |       |
| Member contributions  |       |

## 11. Backtest results

<!-- backtest:start -->

Simulated data only. Generated by `npm run backtest`; see `docs/BACKTEST.md` for parameters, per-menu results and limitations.

| Metric                | Baseline      | FOODOO        | Change | Verdict       |
| --------------------- | ------------- | ------------- | ------ | ------------- |
| Leftover portions     | 2717          | 1935          | -28.8% | FOODOO better |
| Lost sales (portions) | 3950          | 2302          | -41.7% | FOODOO better |
| Sell-out menu-days    | 394           | 411           | +4.3%  | FOODOO worse  |
| Profit                | Rp 68.447.000 | Rp 78.053.000 | +14.0% | FOODOO better |

Diagnostic: the same FOODOO rule without the sell-out correction (sold-out days recorded as demand = sales), compared with FOODOO:

| Metric                | Without correction | FOODOO        | Change  | Verdict       |
| --------------------- | ------------------ | ------------- | ------- | ------------- |
| Leftover portions     | 821                | 1935          | +135.7% | FOODOO worse  |
| Lost sales (portions) | 4861               | 2302          | -52.6%  | FOODOO better |
| Sell-out menu-days    | 590                | 411           | -30.3%  | FOODOO better |
| Profit                | Rp 72.931.500      | Rp 78.053.000 | +7.0%   | FOODOO better |

Estimator check (mean absolute error in portions, lower is better):

| Policy   | Sold-out menu-days | Estimator MAE | Sales = demand MAE |
| -------- | ------------------ | ------------- | ------------------ |
| Baseline | 394                | 2.62          | 10.03              |
| FOODOO   | 411                | 2.09          | 5.60               |

<!-- backtest:end -->

## 12. Lighthouse and bundle size

Generated by `npm run lighthouse` with the preview server running; never typed by hand. Bundle size: `npm run size`.

<!-- lighthouse:start -->

Measured with Lighthouse 12.8.2 (`npx lighthouse@12.8.2`) by `npm run lighthouse` against `npm run preview` on the machine that ran it. Mobile uses Lighthouse's default simulated Slow 4G network and 4x CPU slowdown; desktop uses `--preset=desktop`. "Cold" is a first visit with empty storage and no cache. The other rows load the demo and save a plan first, so the screens show real content; they are repeat visits served by the service worker, which is why they are faster. Performance scores vary between runs and machines.

| Page            | Preset  | State            | Accessibility | Best practices | Performance | First contentful paint | Largest contentful paint |
| --------------- | ------- | ---------------- | ------------- | -------------- | ----------- | ---------------------- | ------------------------ |
| / (first visit) | mobile  | cold, empty      | 100           | 100            | 98          | 1.66 s                 | 2.04 s                   |
| / (first visit) | desktop | cold, empty      | 100           | 100            | 100         | 0.42 s                 | 0.49 s                   |
| /today          | mobile  | demo, plan saved | 100           | 100            | 97          | 0.22 s                 | 0.42 s                   |
| /today          | desktop | demo, plan saved | 100           | 100            | 100         | 0.09 s                 | 0.13 s                   |
| /plan           | mobile  | demo, plan saved | 100           | 100            | 98          | 0.17 s                 | 0.37 s                   |
| /plan           | desktop | demo, plan saved | 100           | 100            | 100         | 0.08 s                 | 0.11 s                   |
| /service        | mobile  | demo, plan saved | 100           | 100            | 95          | 0.17 s                 | 0.36 s                   |
| /service        | desktop | demo, plan saved | 100           | 100            | 100         | 0.08 s                 | 0.12 s                   |
| /how            | mobile  | demo, plan saved | 100           | 100            | 95          | 0.17 s                 | 0.34 s                   |
| /how            | desktop | demo, plan saved | 100           | 100            | 100         | 0.10 s                 | 0.13 s                   |

Failed accessibility or best-practices audits: none.

<!-- lighthouse:end -->
