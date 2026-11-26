# SPEC.md — FOODOO Product and Logic Specification

## 1. Problem (from the submitted abstract)

Small food stalls (*warung*) cook each menu once a morning and decide portions by feel. Leftovers waste money. Cooking too little makes popular menus sell out early. That second loss is invisible: a sold-out day records sales, not how many people wanted to buy, so popular menus stay under-cooked. Forecasts built on sales cut off by stock-outs underestimate true demand.

## 2. Users

**Primary:** owners of small warung in residential neighbourhoods who cook in morning batches and record sales in a notebook or not at all. They have no POS system.

Their constraints, which drive the design:
- Android phone, possibly low-end, with unreliable or paid mobile data.
- Busy during service: one hand, a few seconds at a time.
- Total daily input must take **under one minute**.

## 3. Case 2 alignment

Case 2 asks for a working service flow, appropriate handling of user data, and an achievable improvement.

| Case 2 asks for | FOODOO delivers |
|---|---|
| Working service flow | The daily loop: plan → service → close → next suggestion |
| Appropriate handling of user data | All data on the device; no account; no customer data; export and delete-all |
| Achievable improvement (fewer errors, faster responses) | Fewer portion errors: less leftover and fewer lost sales, measured by the backtest and weekly metrics |

## 4. The core loop (must match the abstract exactly)

1. **One-time setup:** menus, prices, costs, and busy hours.
2. **Each morning:** the owner accepts or edits a suggested portion count. Each suggestion shows a reason.
3. **During service:** one tap records when a menu sells out.
4. **At night:** the owner enters leftovers and confirms any missed sell-out time.

FOODOO then estimates true demand on sold-out days from the sell-out time and the busy-hour profile. It suggests the next quantity by weighing margin against cost.

## 5. Features

Priority: **Core** = required for the one complete core flow. **Should** = planned; some are reserved for Final Day (see `PLAN.md`). **Out** = not built.

### 5.1 Onboarding and setup — Core

| ID | Requirement |
|---|---|
| ON-1 | First launch offers **Start setup** and **Try demo stall** |
| ON-2 | Add, edit and archive menus. Fields: name (1–40 chars), selling price (Rp, integer > 0), cost per portion (Rp, integer ≥ 0 and < price), usual portions (integer 1–999) |
| ON-3 | Set opening and closing time. Closing must be after opening; same-day only |
| ON-4 | Busy-hour profile: one cell per opening hour, tap to cycle *quiet* (1) → *normal* (2) → *busy* (4). Default: normal |
| ON-5 | Setup can be completed in under 3 minutes for 4 menus |

Acceptance:
- *Given* no data, *when* the app opens, *then* the onboarding screen shows both options.
- *Given* a cost ≥ price, *when* saving a menu, *then* the field shows an inline error and saving is blocked.
- *Given* setup is finished, *when* the app opens again, *then* it goes to the Today screen.

### 5.2 Morning plan — Core

| ID | Requirement |
|---|---|
| PL-1 | Show one card per active menu with today's suggested quantity and a one-line reason |
| PL-2 | +/− steppers edit the quantity (min 0, max 999); a long press repeats |
| PL-3 | **Accept all** saves the plan with one tap |
| PL-4 | Store both `suggestedQty` and the final `cookedQty`; mark edited cards visibly |
| PL-5 | The plan can be edited again until the first sell-out tap of the day |

Acceptance:
- *Given* history exists, *when* the plan screen opens, *then* every card shows a number and a reason produced by `suggestQty`.
- *Given* the owner changes 42 to 45, *when* saving, *then* `suggestedQty = 42` and `cookedQty = 45` are stored.

### 5.3 Service — Core

| ID | Requirement |
|---|---|
| SV-1 | One large tile per menu planned today |
| SV-2 | Tap marks the menu sold out and stores the current time (minute precision) |
| SV-3 | An **Undo** toast shows for 10 seconds |
| SV-4 | Long press on a sold-out tile edits the time |
| SV-5 | Works fully offline |

Acceptance:
- *Given* a planned menu, *when* tapped at 10:32, *then* the tile shows "Sold out 10:32" and `soldOutAt = "10:32"` is stored.
- *Given* a sold-out tap, *when* Undo is pressed within 10 s, *then* `soldOutAt` returns to `null`.

### 5.4 Night close — Core

| ID | Requirement |
|---|---|
| CL-1 | Menus that sold out show their time (editable) |
| CL-2 | Other menus show a leftover stepper from 0 to `cookedQty` |
| CL-3 | If leftover = 0 and there was no sell-out tap, ask "About what time did it run out?" with a time picker. Default: closing time |
| CL-4 | Toggle **Unusual day** (rain, holiday, event): the day is kept but excluded from suggestions |
| CL-5 | **Close day** computes demand for each menu and shows tomorrow's suggestions |
| CL-6 | A day left unclosed is marked incomplete and excluded from estimates |

Acceptance:
- *Given* Ayam Goreng cooked 31 with leftover 3, *when* the day is closed, *then* `estimatedDemand = 28` and `demandIsEstimate = false`.
- *Given* Nasi Uduk cooked 42 sold out at 10:30 with the reference profile (§6.6), *when* the day is closed, *then* `estimatedDemand = 81` and `demandIsEstimate = true`.

### 5.5 Today screen — Core

| ID | Requirement |
|---|---|
| TD-1 | The home screen shows the daily loop as three phases (Plan, Service, Close) with the current phase highlighted from the clock and the stored state |
| TD-2 | One primary action, which opens the current phase |
| TD-3 | Shows today's counts: portions planned, menus sold out, day closed yes/no |

### 5.6 Weekly summary and history — Should (built early on 2026-11-25 by team decision, D-083)

| ID | Requirement |
|---|---|
| WS-1 | Last 7 days: total leftover portions, number of sell-out events, estimated lost sales (sum of `estimatedDemand − cookedQty` on sold-out days) |
| WS-2 | Per-menu table: cooked, sold, leftover, demand (estimates labelled) |
| WS-3 | Bar chart of cooked vs demand per day for a selected menu |
| WS-4 | List of past days (newest first) and a read-only view of one day per menu: cooked, suggested, sell-out time, leftover, demand (estimates labelled), reason |

WS-1 is shown on the Today screen and on the History screen; WS-2 to WS-4 are on the History screen.

### 5.7 Data management — Core (export) / Should (import)

| ID | Requirement | Priority |
|---|---|---|
| DM-1 | Delete all data, with confirmation | Core |
| DM-2 | Load demo stall / remove demo stall | Core |
| DM-3 | Export JSON (full), CSV (menu-days) and XLSX (full, four sheets) | Should, built early (D-083) |
| DM-4 | Import with schema validation: JSON and XLSX replace all data after confirmation; CSV adds or updates menu-days for existing menus. Nothing is written unless the whole file is valid | Should, built early (D-083) |
| DM-5 | Request persistent storage (`navigator.storage.persist`) | Core |

### 5.8 Settings — Core

Edit menus, hours, busy profile, salvage value per menu (default 0); language toggle; about (version, licences, AI disclosure link).

### 5.9 Out of scope

Payments, receipt printing, ingredients and stock purchasing, accounts, cloud sync, multi-device, delivery, customer data, any AI/ML model in the product.

### 5.10 Register mode and sales-linked close — Should (stage 3, D-091)

Added by team decision on 2026-11-25 (D-091), which lifts "per-transaction sales recording" from §5.9. The register is optional: **simple mode** (§5.3 as written) stays fully functional with zero `Sale` rows. The register records what sold; it never takes real payments. Cash and QRIS are labels only.

**Types.** `Sale { id, date, time, createdAt, groupId, menuId, qty, unitPrice, method: 'cash' | 'qris' }`. `MenuDay.soldOutSource?: 'manual' | 'auto_pos' | 'unknown_time'`. `StallSettings.mode?: 'simple' | 'pos'` (default `simple`).

| ID | Requirement |
|---|---|
| RG-1 | In `pos` mode the Sales tab is a register: one tile per planned menu with remaining portions (`cookedQty − sold`) and a stock bar; tapping adds one portion to the cart |
| RG-2 | The cart is a bottom sheet with +/− per line, payment method label (cash or QRIS), cash chips (exact, 20,000, 50,000, 100,000) and change due |
| RG-3 | Saving a transaction writes all its `Sale` rows and any sold-out marks in one database transaction under one `groupId`, or nothing |
| RG-4 | The last transaction of the day can be voided; today's transactions are listed; revenue and transaction count are shown |
| RG-5 | Selling beyond the plan is allowed and labelled "over plan". Remaining stays at 0 and the engine sees the menu as sold out at the first time it hit 0 |
| SO-1 | When a sale brings remaining to 0 and the menu has no sell-out time, `soldOutAt` = the sale time and `soldOutSource = 'auto_pos'`, with a toast |
| SO-2 | Voiding a transaction removes an `auto_pos` mark if remaining is above 0 again. A manual mark is kept |
| SO-3 | A manual **Sold out** button (with Undo for 10 s) sets `soldOutSource = 'manual'` in both modes |
| SM-1 | Settings switches mode at any time. `Sale` rows are kept when switching to simple |
| CL-7 | At night in `pos` mode leftover is prefilled with remaining. If the owner enters another number, a neutral note shows both numbers |
| CL-8 | Leftover 0 without a sell-out time asks for the time, with a **Don't remember** choice: time = closing time, `soldOutSource = 'unknown_time'` |
| CL-9 | A sold-out menu offers **Some left over**: the sell-out mark is cancelled and a leftover count is entered |
| CL-10 | **Save all** (the confirm button of Close day) closes the day. A closed day can be corrected for 7 days after its date; correcting re-estimates demand |
| CL-11 | `sold = cookedQty − leftover` for the engine. Revenue = sum of `qty × unitPrice` (pos) or `sold × price` (simple) |
| TP-1 | Morning plus night take at most 20 taps for 5 menus, in both modes (unit-tested) |

### 5.11 Money view, cooking list and navigation cues — Should (2026-11-26, D-096)

Added at the team's request. Everything is derived from data the app already stores; no schema change and no new input.

| ID | Requirement |
|---|---|
| MN-1 | The Plan screen shows the cooking cost (Σ quantity × cost) and the sales if every portion sells (Σ quantity × price) for the numbers on screen |
| MN-2 | The weekly summary shows money lost on leftovers (Σ leftover × max(0, cost − salvage)) and margin missed by selling out (Σ max(0, estimated demand − cooked) × (price − cost), labelled estimate), over the same days as WS-1, at current menu prices |
| SH-1 | Today lists each cooked menu with its state (available, sold-out time, or leftover). **Share list** hands the date, stall name, portions per menu and total to the device share sheet, or copies it when there is none. Nothing leaves the device without that tap |
| NV-1 | The navigation marks the current loop step with a visible shape and an accessible description, never colour alone |
| NV-2 | Service shows how many menus have sold out; Close shows how many menus are ready to close |
| NV-3 | Settings has a link to each of its sections |
| DM-6 | JSON and XLSX backups keep register sales, the sales mode and the sell-out source. A backup without them still imports. CSV keeps the sell-out source but not sales or the mode |

### 5.12 Tutorial and hourly simulation — Should (2026-11-27, D-099)

Added at the team member's request. Demo stall only; no schema change.

| ID | Requirement |
|---|---|
| TOUR-1 | On the first visit a step-by-step tutorial highlights the element to press and dims the rest. It can be skipped per step, ended at any time and replayed from Settings. It never shows over the owner's own stall |
| SIM-1 | Simulated customers arrive hour by hour following the busy-hour profile and weekday factor, one portion each, from a fixed seed. Each hour lists its transactions, including customers turned away |
| SIM-2 | After closing hour the day is estimated and added to the simulation's history; the next day is planned with `suggestQty`. Play repeats until paused |
| SIM-3 | The analysis updates every hour: average customers per hour, menus ordered by profit per day over the last 14 normal closed days, and the next portions per menu. Estimates are labelled |
| SIM-4 | Nothing from the simulation is stored |

## 6. Logic (exact; implement in `src/domain/`)

### 6.1 Types

```ts
type HHMM = string;
type ISODate = string;
type BusyLevel = 1 | 2 | 4;

interface Menu { id: string; name: string; price: number; cost: number; salvage: number; usualQty: number; archived: boolean }
interface StallSettings { openAt: HHMM; closeAt: HHMM; busyProfile: Record<string, BusyLevel>; isDemo: boolean }
interface DayRecord { date: ISODate; weekday: number; unusual: boolean; closed: boolean }
interface MenuDay { date: ISODate; menuId: string; suggestedQty: number | null; reason: Reason | null; cookedQty: number; soldOutAt: HHMM | null; leftover: number | null; estimatedDemand: number | null; demandIsEstimate: boolean }
interface Reason { code: 'cold-start' | 'cold-start-up' | 'cold-start-down' | 'history' ; scope: 'weekday' | 'recent'; observations: number; soldOutDays: number; leftoverDays: number; delta: number }
interface Suggestion { menuId: string; qty: number; reason: Reason }
```

`busyProfile` keys are opening-hour starts, `"06"` … `"13"` for 06:00–14:00. A reason is stored as data and rendered to text through i18n.

### 6.2 `arrivalShare(settings, at): number`

The share of the day's customers expected to have arrived by time `at`.

- Let *wₕ* be the weight of hour slot *h*, and *W = Σ wₕ*.
- For `at` within slot *k* with minute fraction *f = minutes / 60*: `share = (Σ_{h<k} wₕ + f · w_k) / W`.
- Before opening → 0. At or after closing → 1.

### 6.3 `estimateDemand(cooked, leftover, soldOutAt, settings)`

- **Not sold out** (`soldOutAt === null` and `leftover !== null`): `demand = cooked − leftover`, `isEstimate = false`.
- **Sold out:** `s = arrivalShare(settings, soldOutAt)`.
  - If `s ≥ 0.95`: `demand = cooked`, `isEstimate = true`.
  - Otherwise: `demand = min(round(cooked / s), 3 × cooked)`, `isEstimate = true`. If `s = 0`, use `3 × cooked`.
- `round` is round-half-up. To avoid floating-point error, compute `cooked × W / A`, where `A` is the weighted arrivals numerator from §6.2, and round with `Math.round(x + 1e-9)`.

### 6.4 `criticalRatio(menu)`

`CR = (price − cost) / (price − salvage)`, clamped to `[0.05, 0.95]`.

### 6.5 `suggestQty(menu, weekday, menuDays, days)`

1. **Eligible days:** closed, not unusual, with `estimatedDemand !== null`, for this menu.
2. **History:** the latest 8 eligible days on the same weekday (`scope = 'weekday'`). If fewer than 5, use the latest 14 eligible days of any weekday (`scope = 'recent'`).
3. **If the history has ≥ 5 values:** `qty = round(quantile(values, CR))`, where `quantile` uses linear interpolation on sorted values: `h = (n − 1) · p`, `q = x[⌊h⌋] + (h − ⌊h⌋)(x[⌊h⌋+1] − x[⌊h⌋])`. Reason code `history`; `delta = qty − last cookedQty`.
4. **Otherwise (cold start):** `base = usualQty`. If the most recent eligible day sold out → `ceil(base × 11 / 10)`, code `cold-start-up`. If its leftover > 20% of cooked → `floor(base × 9 / 10)`, code `cold-start-down`. Use integer arithmetic: `base × 1.1` in floating point gives 44.000000000000004 for 40 and the wrong ceiling. Else `base`, code `cold-start`.
5. Clamp to `[0, 999]`.

**Reason text** (rendered by i18n, English shown):
- `history` + sold-out days > 0: "Sold out on {soldOutDays} of the last {observations} {weekday}s → {±delta}" (with `scope = 'recent'`: "… of the last {observations} days …")
- `history` + leftover days > 0: "Leftovers on {leftoverDays} of the last {observations} days → {±delta}"
- `history` otherwise: "Based on the last {observations} days"
- `cold-start*`: "Not enough history yet. Starting from your usual {usualQty}" (+ "sold out last time" / "leftovers last time")

### 6.6 Required unit test cases

**Reference profile:** open 06:00, close 14:00. Weights: 06→1, 07→4, 08→4, 09→2, 10→2, 11→4, 12→4, 13→2. W = 23.

| # | Function | Input | Expected |
|---|---|---|---|
| T1 | arrivalShare | 10:30 | 12/23 ≈ 0.5217 |
| T2 | arrivalShare | 12:15 | 18/23 ≈ 0.7826 |
| T3 | arrivalShare | 05:30 / 14:00 | 0 / 1 |
| T4 | estimateDemand | cooked 42, sold out 10:30 | 81, estimate |
| T5 | estimateDemand | cooked 24, sold out 12:15 | 31, estimate |
| T6 | estimateDemand | cooked 24, sold out 13:50 (share ≈ 0.9855) | 24, estimate |
| T7 | estimateDemand | cooked 10, sold out 06:30 (share ≈ 0.0217) | 30 (cap), estimate |
| T8 | estimateDemand | cooked 31, leftover 3 | 28, not estimate |
| T9 | criticalRatio | price 8000, cost 4500, salvage 0 | 0.4375 |
| T10 | criticalRatio | price 5000, cost 4900 | 0.05 (clamped from 0.02) |
| T11 | quantile | [30, 32, 35, 40, 41], p 0.4375 | 34.25 → suggest 34 |
| T12 | quantile | [30, 32, 35, 40, 41], p 0.75 | 40 |
| T13 | suggestQty | 3 eligible days, last sold out, usual 40 | 44, `cold-start-up` |
| T14 | suggestQty | 3 eligible days, last leftover 10 of 40, usual 40 | 36, `cold-start-down` |
| T15 | suggestQty | unusual and unclosed days present | excluded from history |
| T16 | suggestQty | 6 same-weekday + 20 other days | uses only the 6 same-weekday days |

Target: 100% line coverage on `src/domain/`.

## 7. Demo data generator (`src/demo/generator.ts`)

Deterministic with a fixed seed (`seedrandom`, seed `"foodoo-demo"`).

- Stall "Warung Demo" (the name must contain "Demo"). Four menus:
  - Nasi Uduk: price 8000, cost 4500, usual 40, true mean 52
  - Ayam Goreng: price 12000, cost 7000, usual 30, true mean 27
  - Sayur Lodeh: price 5000, cost 2500, usual 25, true mean 20
  - Tempe Orek: price 4000, cost 1500, usual 28, true mean 29
- Weekday factor: Mon 1.15, Tue 0.95, Wed 1.0, Thu 0.95, Fri 1.1, Sat 1.2, Sun 0.7.
- True daily demand ~ Poisson(mean × weekday factor).
- Customer arrival times follow the reference busy profile.
- Owner policy in history: cook `usualQty` ± a random 0–3.
- A menu sells out at the arrival time of customer number `cookedQty + 1`. Otherwise leftover = cooked − demand.
- 56 days of history ending yesterday; about 1 day in 10 marked unusual.
- The true demand is kept **only** in the generator for the backtest. It is never stored in the app database.

**Extra demo scenarios** (`src/demo/scenarios.ts`, approved by the team on 2026-11-25). The stall above is scenario 1. Three more synthetic stalls use the same model with their own seed, hours, busy profile, menus, weekday factors and history length: 2 *Demo Warung Makan Kantor* (10:00–15:00, quiet weekends), 3 *Demo Angkringan Malam* (18:00–02:00, crosses midnight), 4 *Demo Warung Baru Buka* (07:00–13:00, 4 days of history, a menu with salvage value). Every name contains "Demo". **Try demo stall** opens a choice of the four, each with its hours, history length and a one-line description. The stall stores which scenario it is and the stall date it was generated for; when the app is opened on a later stall date, the same scenario is generated again for that date (a demo without this marker, such as one imported from an older backup, is never regenerated). The build-time variable `VITE_DEMO` is `on` (default) or `off` (no demo offered). The backtest uses scenario 1 only.

## 8. Backtest (`scripts/backtest.ts`, `npm run backtest`)

The backtest is evidence for the judges, so it must be honest and reproducible.

- Simulate 3 seeds × 12 weeks with the generator's demand model.
- Policies:
  - **Baseline:** cook `usualQty` every day.
  - **FOODOO:** cook `suggestQty` using only observed data (censored sales + sell-out times + leftovers), never the true demand.
- Metrics per policy, weeks 3–12:
  - leftover portions
  - lost sales (true demand − cooked, when positive)
  - sell-out days
  - profit = Σ(min(demand, cooked) × price) − Σ(cooked × cost)
- Also report an **estimator check**: mean absolute error of `estimateDemand` vs true demand on sold-out days, compared with the naive "sales = demand".
- Write `docs/BACKTEST.md` with the seeds, parameters, a results table, and a "Limitations" paragraph (synthetic data, model assumptions). Report the numbers as they come out, including when FOODOO does worse on a metric.

## 9. Success metrics in the app

Computed in `src/domain/metrics.ts` and shown only from real stored data:
- weekly leftover portions
- sell-out frequency
- estimated lost sales (labelled estimate)
- share of suggestions accepted without edit
