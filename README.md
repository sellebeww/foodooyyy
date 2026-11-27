# FOODOO

**Daily portion planning that counts the customers a sold-out menu hides.**

[Live demo](https://foodoo-d5h.pages.dev) · Offline-first PWA · English / Bahasa Indonesia

Team **Calon Mantu Idaman** (Samuel Matthew, Vassel Goleyu, Hakim Ulinnuha, Sonny Ferdinand) · STACK 2026 by GDGoC ITB · Case 2: Stronger Communities and Everyday Services

```bash
npm ci && npm run dev   # Node 22
```

## 1. Overview

- **Problem.** Small food stalls (_warung_) decide portions by feel. Leftovers waste money; sold-out menus hide how many people wanted to buy.
- **Users.** Warung owners on an Android phone, often with little mobile data and a few seconds at a time.
- **Rules only.** Deterministic TypeScript, no AI or ML model inside the product, no backend.

| Step     | The owner                                                      | FOODOO                                      |
| -------- | -------------------------------------------------------------- | ------------------------------------------- |
| Setup    | Enters menus, prices, costs and busy hours once                |                                             |
| Morning  | Accepts or edits the suggested portions                        | Gives a reason for each suggestion          |
| Service  | Taps when a menu sells out, or rings up sales in Register mode | Records the sell-out time                   |
| Night    | Enters leftovers and confirms missed sell-out times            | Estimates true demand on sold-out days      |
| Tomorrow |                                                                | Suggests new portions from corrected demand |

## 2. Feature status

Source of truth: `PLAN.md` section 4. Acceptance criteria: `SPEC.md`. Evidence: `docs/DECISIONS.md` and `tests/`.

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
| MN       | Money view: cooking cost, leftover cost, margin missed             | Should   | Done                   |
| SH       | Today's menus list and share the cooking list                      | Should   | Done                   |
| NV       | Current-step marker, progress cues, settings section links         | Should   | Done                   |
| TOUR     | First-run interactive tutorial                                     | Should   | Done                   |
| SIM      | Hourly stall simulation with live demand analysis                  | Should   | Simulated              |
| UX-FIX   | Top usability fix from owner testing                               | Should   | Reserved for Final Day |

Allowed status values: `Not started`, `In progress`, `Done`, `Reserved for Final Day`, `Simulated` (works on demo data only).

## 3. Setup

- **Environment:** Node.js 22.12.0 or a later 22.x (`.nvmrc`), npm 10+. Chrome, Edge, Firefox, Safari (e2e on Chromium only).
- **Dependencies:** pinned exactly; licences in section 7.

| Command                                               | Does                                              |
| ----------------------------------------------------- | ------------------------------------------------- |
| `npm ci`                                              | Install                                           |
| `npm run dev`                                         | Development server                                |
| `npm run check`                                       | Types, lint, unit tests, build                    |
| `npx playwright install chromium`, then `npm run e2e` | End-to-end tests (browser install once)           |
| `npm run backtest`                                    | Rewrite `docs/BACKTEST.md` and section 11         |
| `npm run lighthouse`                                  | Rewrite section 12 (preview server must be up)    |
| `npm run seed` / `npm run size`                       | Rewrite `docs/DEMO_SCENARIOS.md` / report bundles |

Set `VITE_DEMO=off` in `.env` (copy `.env.example`) to hide the demo stalls; the value is fixed at build time.

## 4. Demo access

- **URL:** https://foodoo-d5h.pages.dev (Cloudflare Pages, from `main`; it may lag other branches).
- **Load demo data:** first screen → **Try demo stall** → pick one of four made-up stalls (synthetic history, fixed seed, dates follow today). Every screen shows a yellow **Demo data** sticker. Demo data cannot be loaded over the owner's own data.
- **Reset:** Settings → Data → **Reset demo data**, **Choose another demo stall** or **Remove demo stall**.
- **Tutorial:** 16 steps on the first visit, can be ended any time. Replay: Settings → Data → **Replay tutorial** (demo stall only).
- **Hourly simulation:** demo stall → Today → **Open simulation**. Simulated customers arrive hour by hour; nothing is saved.
- **Register mode:** Settings → Sales mode → Register, plan today, open the Sales tab.
- **Vercel:** `vercel.json` is committed; import the repository or run `vercel --prod`. No environment variable is required. No Vercel URL is recorded until a deployment exists.

## 5. Local fallback

```bash
npm ci
npm run build
npm run preview   # http://localhost:4173
```

Fonts and icons are self-hosted and there is no backend, so after install nothing needs the internet; after the first load the service worker also works with no server. Verified by `e2e/noNetwork.spec.ts` (external requests blocked) and `e2e/coreLoop.spec.ts` (online and offline). Not done: a run with the laptop's network adapter off; rehearse it before the Final Day (`FINAL_DAY.md`).

## 6. Data and privacy

- No account, server, analytics, API keys or customer data.
- Stall data stays on the device in IndexedDB (`foodoo`, via Dexie): settings, menus, daily plans, sell-outs, leftovers and, in Register mode, sales (menu, quantity, price, payment label).
- Data leaves only when the owner taps **Share list** (cooking list to the share sheet or clipboard) or exports a file.
- Settings → Data: **Delete all data** (with confirmation), **Export** (JSON, CSV, XLSX) and **Import** (validated before anything is written).
- The language choice (`localStorage`, `foodoo.language`) survives **Delete all data**.
- The app asks for persistent storage; Settings shows the browser's answer.

## 7. Third-party resources

Licences read from each package's `package.json` and font licence file.

| Resource                                                                        | Version        | Use                                   | Licence                   |
| ------------------------------------------------------------------------------- | -------------- | ------------------------------------- | ------------------------- |
| react, react-dom                                                                | 18.3.1         | UI                                    | MIT                       |
| react-router-dom                                                                | 6.30.6         | Routing                               | MIT                       |
| dexie                                                                           | 4.4.7          | IndexedDB storage                     | Apache-2.0                |
| dexie-react-hooks                                                               | 4.4.0          | Live queries                          | Apache-2.0                |
| vite-plugin-pwa                                                                 | 2.0.0          | Service worker and manifest           | MIT                       |
| workbox-build, workbox-window                                                   | 7.4.1          | Peer dependencies of vite-plugin-pwa  | MIT                       |
| seedrandom                                                                      | 3.0.5          | Deterministic demo data and backtest  | MIT                       |
| vite                                                                            | 7.3.8          | Build tool                            | MIT                       |
| @vitejs/plugin-react                                                            | 5.2.0          | React support for Vite                | MIT                       |
| typescript                                                                      | 5.9.3          | Language                              | Apache-2.0                |
| vitest, @vitest/coverage-v8                                                     | 3.2.7          | Unit tests and coverage               | MIT                       |
| jsdom                                                                           | 28.1.0         | DOM for unit tests                    | MIT                       |
| fake-indexeddb                                                                  | 6.2.8          | IndexedDB for unit tests              | Apache-2.0                |
| @testing-library/react, @testing-library/dom                                    | 16.3.3, 10.4.2 | Component tests                       | MIT                       |
| @playwright/test                                                                | 1.65.1         | End-to-end tests and icon rendering   | Apache-2.0                |
| eslint, @eslint/js                                                              | 9.39.5         | Linting                               | MIT                       |
| typescript-eslint                                                               | 8.55.0         | TypeScript lint rules                 | MIT                       |
| eslint-plugin-react-hooks                                                       | 7.1.1          | Hooks lint rules                      | MIT                       |
| globals                                                                         | 17.14.0        | Lint environment globals              | MIT                       |
| prettier                                                                        | 3.10.1         | Formatting                            | MIT                       |
| jest-axe, axe-core                                                              | 10.0.0, 4.10.2 | Accessibility checks in tests         | MIT, MPL-2.0              |
| @types/react, @types/react-dom, @types/node, @types/seedrandom, @types/jest-axe | see lockfile   | Type definitions                      | MIT                       |
| lighthouse (via `npx`, not installed)                                           | 12.8.2         | Measurement only                      | Apache-2.0                |
| Space Grotesk (latin subset, self-hosted)                                       | v22            | UI typeface, `public/fonts/`          | SIL Open Font License 1.1 |
| Rubik Mono One (outlines of F, D, O)                                            | v20            | Logo letters as SVG paths; not loaded | SIL Open Font License 1.1 |

ZIP, XLSX and CSV handling are written for this project (browser `CompressionStream`, no library). UI icons, logo and PWA icons were drawn for this project. Project licence: **pending team decision** (no `LICENSE` file yet).

## 8. AI assistance

Material AI assistance, as required by STACK 2026. Details per decision are in `docs/DECISIONS.md`. The team owns and must be able to explain every module.

| Date                     | Tool                                         | Module                                    | What the AI did                                                                                     | Reviewed by                                             |
| ------------------------ | -------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 2026-11-25 to 2026-11-27 | Claude Code (Claude Sonnet 5.5 and Opus 5.5) | All code, tests, scripts, config and docs | Wrote, reviewed and fixed code and tests, designed UI and logo, wrote docs, ran checks and releases | Team approved CHECKPOINT F1; the rest is pending review |
| 2026-11-27               | Codex                                        | Repository publication                    | Compared the local snapshot with both GitHub branches and ran repository checks                     | Pending review                                          |

## 9. Known limitations

**Not built or untested**

- The abstract's cashier **+1 turned away** tap is not built.
- Not tested with real warung owners; setup under 3 minutes (ON-5) and daily input under one minute are untimed. UX-FIX is reserved for the Final Day.
- E2e covers Chromium only. Installability was checked with Chromium's report, not on a physical phone. The tutorial, simulation and D-096 changes were not checked on a physical device, Safari or Firefox.
- Night stalls (closing after midnight) have domain and unit tests only.

**Simulated**

- All backtest and demo figures are simulated. They show how the rules behave under stated assumptions, not benefit to real stalls (`docs/BACKTEST.md`).
- Hourly simulation (D-099): one portion per customer, made-up demand, menus already on the stall only, kept in memory.

**Behaviour**

- Register mode: same phone only, no second device or third-party POS; cash and QRIS are labels (no payments, receipts or ingredients); only the latest transaction of a day can be voided.
- A closed day can be corrected for 7 days. A plan with every menu at 0 portions cannot be closed (D-066).
- JSON and XLSX backups keep sales and sales mode; CSV does not. Importing an older backup without them removes sales and resets the mode to simple.
- XLSX/CSV have no formatting or formula recalculation; CSV import only updates days of existing menus; import needs Chrome 103+, Safari 16.4+ or Firefox 113+.
- Money figures use today's prices and costs, also for past days; margin missed is an estimate built on estimated demand.
- Undo covers only the latest sell-out tap. Menu cards have no photos.

**Measurement**

- Section 12 comes from one machine with simulated throttling (2026-11-26). Cold mobile largest contentful paint is 2.05 s, just over the 2 s target (D-069).
- Screenshots in `docs/ui/` predate the D-095 redesign.

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

Generated by `npm run lighthouse`; never typed by hand. Bundle size: `npm run size`.

<!-- lighthouse:start -->

Measured with Lighthouse 12.8.2 (`npx lighthouse@12.8.2`) by `npm run lighthouse` against `npm run preview` on the machine that ran it. Mobile uses Lighthouse's default simulated Slow 4G network and 4x CPU slowdown; desktop uses `--preset=desktop`. "Cold" is a first visit with empty storage and no cache. The other rows load the demo and save a plan first, so the screens show real content; they are repeat visits served by the service worker, which is why they are faster. Performance scores vary between runs and machines.

| Page            | Preset  | State            | Accessibility | Best practices | Performance | First contentful paint | Largest contentful paint | Layout shift |
| --------------- | ------- | ---------------- | ------------- | -------------- | ----------- | ---------------------- | ------------------------ | ------------ |
| / (first visit) | mobile  | cold, empty      | 100           | 100            | 98          | 1.67 s                 | 2.05 s                   | 0.000        |
| / (first visit) | desktop | cold, empty      | 100           | 100            | 100         | 0.39 s                 | 0.49 s                   | 0.000        |
| /today          | mobile  | demo, plan saved | 100           | 100            | 100         | 0.12 s                 | 0.23 s                   | 0.000        |
| /today          | desktop | demo, plan saved | 100           | 100            | 100         | 0.06 s                 | 0.07 s                   | 0.000        |
| /plan           | mobile  | demo, plan saved | 100           | 100            | 100         | 0.05 s                 | 0.13 s                   | 0.000        |
| /plan           | desktop | demo, plan saved | 100           | 100            | 100         | 0.03 s                 | 0.05 s                   | 0.000        |
| /service        | mobile  | demo, plan saved | 100           | 100            | 100         | 0.05 s                 | 0.12 s                   | 0.000        |
| /service        | desktop | demo, plan saved | 100           | 100            | 100         | 0.05 s                 | 0.06 s                   | 0.000        |
| /how            | mobile  | demo, plan saved | 100           | 100            | 100         | 0.05 s                 | 0.11 s                   | 0.000        |
| /how            | desktop | demo, plan saved | 100           | 100            | 100         | 0.04 s                 | 0.05 s                   | 0.000        |

Failed accessibility or best-practices audits: none.

<!-- lighthouse:end -->
