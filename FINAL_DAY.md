# FINAL_DAY.md — FOODOO Final Day plan

Team **Calon Mantu Idaman**, STACK 2026, Case 2. This file is the feature list and completion plan the handbook asks teams to show at check-in (Final Phase, Build Session, item 2). The feature status table in `PLAN.md` section 4 is the single source of truth; this file must agree with it.

## 1. Starting point: what is done before Final Day

Every Core row in `PLAN.md` section 4 is Done. Each one meets its acceptance criteria in `SPEC.md` and has tests.

| ID       | Feature                                          | Evidence                                                           |
| -------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| ON       | Onboarding and setup                             | `tests/screens/onboarding.test.tsx`                                |
| TD       | Today screen (loop view)                         | `tests/screens/today.test.tsx`, `tests/domain/phase.test.ts`       |
| PL       | Morning plan with reasons                        | `tests/screens/plan.test.tsx`, `tests/db/dayFlow.test.ts`          |
| SV       | Service: one-tap sold out and undo               | `tests/screens/service.test.tsx`, `tests/app/toast.test.tsx`       |
| CL       | Night close, missed sell-out, unusual day        | `tests/screens/close.test.tsx`, `tests/domain/close.test.ts`       |
| EST      | Demand estimation and suggestion logic           | T1 to T16, 100% coverage of `src/domain`                           |
| DEMO     | Demo stall generator and labels                  | `tests/demo/`, "Demo data" sticker on every screen                 |
| PWA      | Offline and installable                          | `e2e/coreLoop.spec.ts` (online and offline), `e2e/smoke.spec.ts`   |
| I18N     | English and Bahasa Indonesia                     | `tests/i18n/messages.test.ts`                                      |
| DM-1/2/5 | Delete all, demo load/remove, persistent storage | `tests/db/repositories.test.ts`, `tests/screens/settings.test.tsx` |
| BT       | Backtest report                                  | `npm run backtest` regenerates `docs/BACKTEST.md` byte for byte    |
| WS       | Weekly summary + history (built early, D-083)    | `tests/screens/history.test.tsx`, `tests/screens/today.test.tsx`   |
| DM-3/4   | Export / import (built early, D-083)             | `tests/db/exportImport.test.ts`, `e2e/exportImport.spec.ts`        |

Also built in F3 and not a separate status row:

- the "How FOODOO calculates" page (`/how`)
- edge-case hardening and a schema-upgrade test
- a bundle-size budget check
- measured Lighthouse scores
- a no-network end-to-end test for the local fallback

## 2. Not finished before Final Day

| Item                                                | State                                                 | Why                                                      |
| --------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| R3 Top usability fix from owner testing (UX-FIX)    | Reserved for Final Day, **blocked on owner findings** | No owner testing has been done yet (see section 3, R3)   |
| Owner testing (PLAN F3 item 1)                      | Not done                                              | No findings were available during F3. None are invented. |
| Physical phone install                              | Not done                                              | Only Chromium's installability report is checked         |
| Largest contentful paint < 2 s on simulated Slow 4G | Missed by about 30 ms                                 | Measured; see README section 12                          |

## 3. Completion plan for the reserved tasks

None of these is started or scaffolded in the repository. Work begins only after the `final-day-start` tag exists.

### R1 and R2: built early, replacements to be chosen

On 2026-11-25 the team decided to build the weekly summary (R1) and export/import (R2) before the `final-day-start` tag (decision D-083). They are Done and no longer count as Final Day work. The team still has to choose replacement Final Day tasks; this file does not invent them.

### R3 Top usability fix from owner testing

- **Owner:** Sonny (process and tests), with Vassel (UI).
- **Blocker:** R3 needs real findings from owners. Before 16 December the team should:
  - run short sessions with real warung owners
  - record each finding in `docs/DECISIONS.md`: what the owner tried, what went wrong, and how many owners hit it
  - choose the top issue
- **On the day:**
  - write a before note with a screenshot
  - fix the issue
  - add a test that fails before and passes after
  - write an after note in the decision log
- If no owner testing happens, R3 stays "Not started" in the status table. It is not replaced by an invented issue.

## 4. Session timeline

The committee announces the session hours, so slots are relative to the start.

| Slot            | What                                                                                 | Who            |
| --------------- | ------------------------------------------------------------------------------------ | -------------- |
| Start           | Check in, record the starting commit, create and push `final-day-start` (section 6)  | Sonny          |
| Start + 15 min  | Show this file to the committee                                                      | All            |
| First half      | Replacement tasks (to be chosen by the team), R3 if findings exist                   | To be assigned |
| Midpoint        | Merge, run `npm run lint && npm test && npm run build && npm run e2e`                | Sonny          |
| Second half     | Finish the replacement tasks, then polish, then the status table                     | All            |
| Cutoff − 30 min | Freeze features; update `PLAN.md` section 4, the README status and the Final Day log | Sonny, all     |
| Cutoff          | Record the final commit; stop modifying the code                                     | All            |

## 5. Setup checklist (before travelling and at the venue)

- [ ] Every laptop has Node 22.12.x (`.nvmrc`), Git, and a clone of the repository at the latest `main`
- [ ] `npm ci` done at home; `npx playwright install chromium` done, so no download is needed at the venue
- [ ] `npm run lint && npm test && npm run build && npm run e2e` green on each laptop
- [ ] The deployed URL https://foodoo-d5h.pages.dev loads, and **Try demo stall** works
- [ ] Local fallback rehearsed (section 7) with Wi-Fi turned off
- [ ] Each member can push to the repository (credentials set up at home; nothing secret committed)
- [ ] Each member has re-read their module's entries in `docs/DECISIONS.md`
- [ ] Chargers, a phone with Chrome for the demo, a USB cable or adapter if needed

## 6. Check-in and cutoff commands

At check-in:

```
git checkout main
git pull
git rev-parse HEAD
git tag -a final-day-start -m "Final Day start"
git push origin final-day-start
```

Write the commit hash and the tag in README section 10 ("Final Day log").

At cutoff:

```
git rev-parse HEAD
git log --oneline final-day-start..HEAD
```

Fill in README section 10:

- the final commit
- the list of changes in the session (from the log above)
- each member's contribution

Then stop modifying the code.

## 7. Local demonstration fallback

If the venue network fails:

1. `npm run build` (done beforehand), then `npm run preview`. The preview server runs on the laptop and needs no internet.
2. Open http://localhost:4173. Press **Try demo stall** and walk the loop.
3. To reset: **Settings → Data → Reset demo data**.

`e2e/noNetwork.spec.ts` checks that every screen works while all requests that are not to localhost are blocked. `e2e/coreLoop.spec.ts` checks the whole loop after the network is cut.

## 8. Risks

| Risk                                      | Plan                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| No owner findings by 16 December          | R3 stays Not started and the README says so; time moves to R1 and R2 tests            |
| Venue network down                        | Local fallback (section 7); dependencies and Playwright browsers installed beforehand |
| A reserved task is not finished at cutoff | Hide its UI (or label it "Coming soon") and record it as unfinished in the README     |
