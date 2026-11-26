# DESIGN.md — FOODOO Interface Specification

Visual style: **calm, confident and warm**. The two brand colours from the logo, navy and orange, carry the identity: navy for the dark surfaces that frame the product (landing hero, sidebar, the Today loop card, the toast), orange for the one primary action and for sold-out states, always with dark text. Everything else is a warm off-white page, white cards, warm hairline borders and soft shadows, so the numbers stay in focus. Semantic tints (green, blue, amber, red) are used only for status. The earlier saturated cream page and the yellow, sky and mint accents were replaced on 2026-11-26 (D-095). Navy and orange surfaces use the quiet gradients `--surface-navy` and `--surface-action` over a solid fallback colour (D-098). There are no background blurs and no endless animations in the app, so it still renders cheaply on low-end phones.

## 1. Brand

- **Logo:** "F∞ / DOO". The word is stacked on two lines; the "OO" of FOO is drawn as an infinity loop. White letters, orange loop, on deep navy.
- **App icon / favicon:** "FO / OD". F top-left, D bottom-right, one diagonal infinity loop through the centre. Navy rounded square, orange loop, white letters.
- **Meaning:** the infinity loop is the daily loop of plan, sell and record. It also stands for the customers a sold-out menu hides, still being counted.
- Build both as SVG components (`src/components/Logo.tsx`, `src/components/AppIcon.tsx`). The letters are Rubik Mono One glyph outlines stored as paths (no font is loaded at runtime), sized to match `docs/brand/FOODOO_logo.png`: in the logo, F is narrowed to about 0.93× and DOO widened to about 1.15× of the natural glyph width; in the icon both letters keep near-natural width. Both marks use one shared infinity path (`BRAND_LOOP`, stroke 50, crossing at about 41°), scaled for the logo and rotated −45° for the icon. Generate PWA icons at 192, 512 and maskable 512 from the icon SVG.

## 2. Tokens (`src/styles/tokens.css`)

The file `src/styles/tokens.css` is the source of truth. The colour roles are:

| Role | Tokens |
| --- | --- |
| Brand | `--navy` #003049, `--navy-900` #00212f, `--navy-700` #0a4563, `--navy-100` #e4eef4 |
| Action | `--orange` #f77f00, `--orange-600` #ea7400 (hover), `--orange-800` #8f4700 (small orange text), `--orange-100`, `--orange-50` |
| Surfaces | `--bg` #f7f4ef, `--paper` #ffffff, `--sunken` #f1ede6, `--line` #e5ded3, `--line-strong` #75828c |
| Text | `--ink` #10212c, `--muted` #4d5d68, `--on-dark` #ffffff, `--on-dark-muted` #b9cddb |
| Status | `--success`, `--info`, `--warn`, `--danger`, each with a `-100` tint |

- Radius 6 / 12 / 16 / 24 px and pill. Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 px.
- `npm run contrast` checks every text and background pair in use.
- Fonts: Space Grotesk (500, 700) for all UI text and numbers, **self-hosted** in `public/fonts/` so the app works offline. The logo letters are Rubik Mono One outlines converted to SVG paths, so that font is not loaded at runtime. Both are under the SIL Open Font License.
- Type scale: 12 (tags) / 14 / 16 (body) / 20 / 24 / 32 / 44 at the default browser text size, written in `rem` so a larger text setting scales it. Portion numbers use `--font-num` (Space Grotesk 700, tabular figures) at 28–32 px. The landing page adds two fluid sizes: `--text-section` and `--text-display`.
- **Press and hover feedback:** a colour change, plus a small press scale (0.97) and, on pointer devices, a 3 px lift for menu tiles and demo cards.
- **Motion (`src/styles/motion.css`):** CSS only, `transform` and `opacity` (colour for hover), 120–420 ms, no animation library, nothing that delays an action. Moments: screen content rises in with a short stagger; the loop segments appear one after another; the sold-out stamp drops onto its tile; the cart count pops; chart bars grow; the stock bar shrinks smoothly; sheets slide up; the active tab pill grows; landing sections slide up as they scroll into view where the browser supports scroll-driven animations. The only repeating animation is the loading bar.
- Respect `prefers-reduced-motion`: every motion rule sits inside `prefers-reduced-motion: no-preference`. Colour feedback stays.

## 3. Language

- Default UI language: **English**. A toggle in Settings switches to **Bahasa Indonesia**, and the choice is persisted.
- All strings live in `src/i18n/en.ts` and `src/i18n/id.ts` with identical keys. Never hard-code strings.
- Currency: `Rp 8.000` in both languages. Time format: `10:32`, 24-hour.

## 4. Layout

- **Mobile first** (360–430 px): single column, a floating bottom tab bar with 5 tabs (Today, Plan, Sales, Close, History) and Settings in the header. The active tab has an orange pill behind its icon.
- **Desktop** (≥ 1024 px): dark navy sidebar with the same items, Settings, and a link to the company page. Content max-width 1120 px (820 px for Settings). Cards use `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`. Today puts the loop card beside today's counts from 900 px.
- Header on every screen: app icon (phone), screen title, date, and a **Demo data** badge (amber pill with a dot) when demo data is loaded. It stays at the top while scrolling, except on screens up to 520 px tall.
- The current loop step carries a dot on its tab and a **Now** pill in the sidebar, with the same text for screen readers.
- Screens up to 520 px tall and under 1024 px wide use a one-row tab bar.
- **Public pages:** the landing page has its own sticky header (section links, language, demo button; a menu button below 1000 px) and a footer.

## 5. Screens

Every screen needs these states designed and built: **default, empty, demo, offline**. Add **error** where input exists.

### 5.1 Onboarding
- Landing (company profile), in order: hero with headline, value statement ("Daily portion planning that counts the customers a sold-out menu hides"), **Start setup** (primary), **Try demo stall**, **Import a file**, and an interactive example "When did it sell out?" worked out by the domain code and badged **Example**; the problem; the daily loop; one sold-out dish followed to the next day; why FOODOO differs; the four demo stalls; the team; a closing call to action. Demo controls are hidden when `VITE_DEMO=off`.
- Step 1, Menus: list of menu cards plus **Add menu**. The add/edit sheet has labelled inputs with inline validation.
- Step 2, Hours: open and close time inputs, and the busy-hour strip (one tappable cell per hour; colours quiet = paper, normal = light orange, busy = orange, and **each cell also shows its label text**).
- A progress indicator: "Step 1 of 2".

### 5.2 Today (home)
- A navy card with the stall name, one sentence saying what to do now, and a large infinity loop split into three segments: **Plan**, **Service**, **Close**. The current segment is orange, finished segments are white, upcoming segments are a muted navy; each step also shows its status as text.
- In the same card, one primary button for the current phase (e.g. "Plan today's portions"). Today's counts sit below it (beside it on wide screens).
- Empty state (no setup): a prompt to finish setup.
- Once a day is planned, **Today's menus** lists each menu with its state and a **Share list** button. The weekly card ends with two money tiles (D-096).

### 5.3 Plan (morning)
- One card per menu: name, photo slot (an optional user photo; a neutral placeholder if none), the stepper with the number in `--font-num`, the reason line, and an "edited" tag when changed.
- A sticky bottom bar shows the total portions, the cooking cost, the sales if all sell, and **Accept all** / **Save plan**.

### 5.4 Service
- A two-column grid of large tiles (minimum 150 px tall).
- Available tile: paper background, menu name, "Cooked 42", and the hint "Tap when sold out".
- Sold-out tile: orange background with a white label "SOLD OUT 10:32". The status text must always be present, never colour alone.
- Undo toast: navy bar at the bottom with an **Undo** button, for 10 s.
- Offline pill: "Offline. Saved on this device."

### 5.5 Close (night)
- The action bar shows how many menus are ready to close; the Service screen shows how many have sold out.
- One row per menu: a sold-out time chip with **Edit**, or a leftover stepper.
- The missed-sell-out prompt appears inline (amber box with a time input).
- An **Unusual day** checkbox with a helper text.
- The **Close day** primary button opens a confirmation sheet listing tomorrow's suggestions.

### 5.6 History (weekly summary)
- Stat tiles: leftover portions, sell-out events, estimated lost sales (with an "estimate" tag), plans accepted as suggested. The same tiles appear on Today under "Last 7 days".
- Content sits in cards with a heading row; status is a coloured badge (Closed green, Unusual blue, Not closed amber). Estimates show `≈ N` with a small blue "estimate" tag under the number.
- Per-menu table and a bar chart of cooked vs demand, with the value above each bar and menu chips to switch. Bars are navy for cooked and orange for demand; estimated demand is a dashed orange outline on light orange. The legend uses both shape and text, and a hidden table gives screen readers the numbers.
- A list of past days opens a read-only day view.

### 5.7 Settings
A row of links jumps to each section. Sections: Stall (menus, hours, busy hours, salvage value), Data (export, import, load/remove demo, delete all, all destructive actions in `--danger` and confirmed), Language, About (version, licences, AI disclosure, "How FOODOO calculates" explainer page).

### 5.8 "How FOODOO calculates" page
A plain-language explanation with the worked example "Sold out at 10:30 → about 52% of customers had arrived → about 81 wanted it". This helps owners trust the suggestions, and judges can verify the logic from the UI.

## 6. Components

`Button` (primary/secondary/danger), `Stepper`, `MenuCard`, `ServiceTile`, `Toast`, `Sticker`, `StatTile`, `BusyHourStrip`, `TimeInput`, `Sheet`, `TabBar`, `Sidebar`, `LoopProgress`, `EmptyState`, `OfflinePill`, `Logo`, `AppIcon`, `icons/*`.

## 7. Accessibility targets (must be measured)

- Lighthouse Accessibility ≥ 95 and Best Practices ≥ 95 on Today, Plan and Service, in both mobile and desktop presets. Record the scores in the README.
- Text contrast ≥ 4.5:1 (orange `#F77F00` is used only as a background with ink text, or as a large graphic, never for small text on the page background or white; small orange text uses `--orange-800`).
- Tap targets ≥ 48 × 48 px.
- Real `<button>`, `<input>` with `<label>`, and `<a href>`. `aria-label` on icon-only buttons. `aria-live="polite"` on the toast.
- Full keyboard operation on desktop with a visible focus ring (3 px navy outline with 2 px offset).
- No information conveyed by colour alone.

## 8. Feedback and microcopy

- Every save shows confirmation within 300 ms (a toast or an inline check).
- Errors say what to do: "Cost must be lower than price".
- Estimates always read "≈ 81 (estimate)", never as a bare number.
- No jargon in the UI: say "suggested portions", not "newsvendor quantile".
