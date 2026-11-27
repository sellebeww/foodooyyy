# PLAN.md — FOODOO Build Plan

Scope: the application only. Dates follow the STACK 2026 timeline (all 23:59 WIB).

| Date | Competition milestone | App state needed |
|---|---|---|
| 30 Nov 2026 | Semifinal submission | Demoable core flow with demo data; a working early prototype |
| 7 Dec 2026 | Top 10 announcement | — |
| 7–15 Dec 2026 | Product improvement | Functional starting point, all Core features, reserved tasks untouched |
| 16 Dec 2026 | Final Day | Build the reserved tasks live, then submit |

## 1. How to work

- Work phase by phase. At each **CHECKPOINT**, stop and report: what changed, the commands to verify, what is not done yet. Wait for the module owner to approve.
- After each phase, update the status table (§4), the README status section, `docs/DECISIONS.md`.
- Never mark a row Done unless its acceptance criteria in `SPEC.md` pass.

## 2. Phases

### F0 — Foundation (target 25 Nov)
1. Scaffold Vite React-TS. Add ESLint, Prettier, Vitest, Playwright, and TypeScript strict mode.
2. Scripts: `dev`, `build`, `preview`, `lint`, `test`, `test:coverage`, `e2e`, `backtest`, `seed`.
3. Standard folder layout. Tokens and base CSS. Self-hosted fonts.
4. CI workflow (GitHub Actions): lint, test, build on every push.
5. Deploy the empty shell to a static host (Vercel or Cloudflare Pages) and put the URL in the README.
6. Write the README skeleton with all required sections.

**CHECKPOINT F0:** `npm run lint && npm test && npm run build` passes; the deployed URL loads.

### F1 — Domain logic and evidence (target 27 Nov)
1. `src/domain/types.ts`, `time.ts` (HH:MM parsing), `estimate.ts`, `suggest.ts`, `metrics.ts` as specified in `SPEC.md` §6.
2. Unit tests T1–T16 from `SPEC.md` §6.6. Domain coverage must be 100%.
3. `src/demo/generator.ts` (`SPEC.md` §7).
4. `scripts/backtest.ts` → `docs/BACKTEST.md` (`SPEC.md` §8). Copy its results table into the README.

**CHECKPOINT F1:** all tests green; `npm run backtest` regenerates `docs/BACKTEST.md` with the same numbers on every run.

### F2 — Core flow, semifinal prototype (target 29 Nov)
1. Dexie schema v1 and repositories (`src/db/`). Seed demo data from the generator.
2. i18n (EN default, ID) and the settings language toggle.
3. Screens: Onboarding, Today, Plan, Service, Close, Settings (without export/import).
4. Mobile layout first, then the desktop sidebar layout.
5. "Demo data" sticker and "estimate" labels.
6. PWA: manifest, icons, service worker. Installable, and works offline after the first load.
7. Playwright e2e **core loop**: load demo → plan (edit one value) → mark one menu sold out → undo → mark again → close the day with a leftover and a missed sell-out time → tomorrow's suggestion is shown → reload → data persists. Run it once online and once with the network offline.

**CHECKPOINT F2 (semifinal state):** the e2e core loop passes. Deploy. Update the status table honestly. This is the prototype the team will show in the semifinal video.

### F3 — Product improvement (7–15 Dec)
1. Fix everything found while testing F2 with real owners. Record each fix in the decision log.
2. "How FOODOO calculates" page.
3. `navigator.storage.persist()` request; delete-all; load/remove demo.
4. Accessibility pass to the `DESIGN.md` §7 targets. Record the Lighthouse scores in the README.
5. Performance: first load < 2 s on a throttled "Slow 4G" mid-range profile. Production JS bundle < 250 KB gzip.
6. Hardening: data persists across app updates (Dexie migration test), edge cases (no menus, all menus archived, day not closed, clock past closing).
7. Local fallback: document and test `npm run build && npm run preview` with no network.
8. Prepare `FINAL_DAY.md` with the feature list, the completion plan for the reserved tasks, and the setup checklist.
9. When the team is ready: tag `final-day-start`. **Do not start the reserved tasks before this tag.**

**CHECKPOINT F3:** every Core row is Done; reserved rows are untouched; the e2e suite passes on the deployed URL and on the local preview.

### F4 — Final Day build session (16 Dec) — RESERVED FOR FINAL DAY

| # | Task | Why it is substantive | Done when |
|---|---|---|---|
| R1 | ~~Weekly summary screen~~ Built early on 2026-11-25 by team decision (D-083), before the `final-day-start` tag; no longer Final Day work. | — | — |
| R2 | ~~Export / import~~ Built early on 2026-11-25 by team decision (D-083), before the `final-day-start` tag; no longer Final Day work. | — | — |
| R1′, R2′ | Replacement tasks: **to be chosen by the team** | — | — |
| R3 | Fix the top usability issue found in owner testing during F3 | Responds to real validation | The issue and the fix are recorded in the decision log, with a before/after note |

At the cutoff: record the final commit, fill in the README "Final Day log" (start tag, final commit, changes, member contributions), and stop modifying the code.

## 3. Scoring map (what evidence the app produces)

### Final phase rubric

| Criterion | Weight | Evidence the app and repo must produce |
|---|---|---|
| Functionality & Reliability | 30% | Complete core loop; e2e suite green online and offline; data persists; demo reset; local fallback |
| Problem Fit & Usefulness | 20% | Built exactly around the abstract's loop; sold-out demand correction visible in the UI; owner-testing fixes logged |
| Technical Quality | 15% | Pure tested domain layer (100% coverage); typed schema with migrations; clean structure; CI; decision log |
| Usability & Accessibility | 10% | One primary action per screen; < 60 s daily input; Lighthouse ≥ 95; bilingual UI; clear feedback |
| Validation & Impact | 10% | Reproducible `BACKTEST.md` vs baseline; estimator error check; honest limitations; in-app metrics |
| Final Day Execution | 10% | `final-day-start` tag; R1–R3 done with traceable commits; Final Day log |
| Pitch & Technical Understanding | 5% | Decision log and module ownership so every member can explain their part |

### Semifinal rubric (app-related parts only)

| Criterion | Evidence from the app |
|---|---|
| Technical Feasibility (20%) | Working deployed prototype; architecture as specified; backtest results |
| Execution & Validation (20%) | Status table; module owners; test results; reserved Final Day plan |

## 4. Feature status (single source of truth; keep identical in the README)

| ID | Feature | Priority | Status |
|---|---|---|---|
| ON | Onboarding and setup | Core | Done |
| TD | Today screen (loop view) | Core | Done |
| PL | Morning plan with reasons | Core | Done |
| SV | Service: one-tap sold out + undo | Core | Done |
| CL | Night close + missed sell-out + unusual day | Core | Done |
| EST | Demand estimation + suggestion logic | Core | Done |
| DEMO | Demo stall generator + labels | Core | Done |
| PWA | Offline + installable | Core | Done |
| I18N | English / Bahasa Indonesia | Core | Done |
| DM-1/2/5 | Delete all, demo load/remove, persistent storage | Core | Done |
| BT | Backtest report | Core | Done |
| WS | Weekly summary + history | Should | Done |
| DM-3/4 | Export / import | Should | Done |
| REG | Register mode, auto sell-out, sales-linked close, 7-day correction | Should | Done |
| MN | Money view: cooking cost, leftover cost, margin missed | Should | Done |
| SH | Today's menus list and share the cooking list | Should | Done |
| NV | Current-step marker, progress cues, settings section links | Should | Done |
| TOUR | First-run interactive tutorial | Should | Done |
| CASE | Case guide: one story per demo stall, with the numbers from its own history | Should | Simulated |
| HOW | Interactive How FOODOO calculates: inputs, sources, two live examples, accuracy limits | Should | Done |
| CHK | Suggestions checked against what happened, on the stall's own history | Should | Done |
| PROF | Company page: ecosystem and trust sections | Should | Done |
| SIM | Hourly stall simulation with live demand analysis | Should | Simulated |
| UX-FIX | Top usability fix from owner testing | Should | Reserved for Final Day |

Allowed status values: `Not started`, `In progress`, `Done`, `Reserved for Final Day`, `Simulated` (works on demo data only).

## 5. Final Day readiness checklist

- [x] Deployed URL reachable; demo data loads from the first screen (smoke e2e against https://foodoo-d5h.pages.dev, 2026-11-25; it still serves the pre-F2 build until the team pushes)
- [ ] `npm ci && npm run build && npm run preview` works offline on a clean machine (verified in a clean copy with non-local requests blocked; a run with the network adapter off is still to do)
- [x] README: setup, dependencies, supported environment, demo access, third-party resources, known limitations, simulated items
- [x] No secrets in the repo history (file-name and content scan, 2026-11-25)
- [ ] `final-day-start` tag created and recorded
- [x] `FINAL_DAY.md` lists completed features, unfinished features, and R1–R3
- [ ] Every member has reviewed `docs/DECISIONS.md` for their module
