# UI audit and refinement (2026-11-25)

Written for the team (Sonny, Vassel). Every number below was produced by a command listed in section 7. Nothing here is estimated.

## 1. Scope and what the brief did not match

This was a polish pass over the screens that already exist. No screen, feature, engine formula or data model was added or changed. The brief named files and sections that this repository does not have (`docs/SPEC.md`, `docs/DESIGN.md`, `docs/PROGRESS.md`, "section 11", "section 12", `src/app/tokens.css`). As in D-091, the repository's own `AGENTS.md`, `SPEC.md` and `DESIGN.md` were followed, and tokens stay in `src/styles/tokens.css`. The decision record is D-093 in `docs/DECISIONS.md`.

## 2. How the audit was done

`scripts/uiShots.ts` drives the production build (`vite preview`) in Chromium and captures every screen and important state: welcome, about, how it works, empty setup, menu sheet (empty and with errors), demo picker, Today (plan phase, planned, closed), Plan (suggested and edited), Service (available, sold out with toast), Close (missed sell-out prompt, confirmation sheet, closed), History, day detail, Settings, setup (filled), the unknown-route redirect, and the Register (empty and with a cart). Viewports: 360x640, 390x844, 768x1024, 1280x800, 1440x900, plus 320x640 for clipping. That is 25 states x 6 viewports = 150 screenshots per run, saved to `docs/ui/before/` and `docs/ui/after/` with a `findings.json` each.

For every capture the script also measures: horizontal scroll, interactive elements smaller than 48 x 48 px (a radio or checkbox counts through its label), the set of font sizes in use, elements that extend past the viewport, and (after only) text whose contrast against the real background under it is below 4.5:1 (3:1 for large text). Colour contrast of the design tokens is checked separately by `npm run contrast`.

## 3. Findings and what was done

| #   | Finding                                                                                                            | Severity | Evidence before                                                    | Fix                                                                                                                                                                       | Evidence after                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Font sizes outside the DESIGN scale, two below the 12 px minimum (10 px chart values, 11 px estimate tag)          | Medium   | sizes in use: 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 30, 32, 44   | Scale tokens `--text-*`; all 75 `font-size` declarations use them                                                                                                         | sizes in use: 12, 14, 16, 20, 24, 28, 32, 44; 0 literal `font-size` in `src/styles/`                                                                                                                                 |
| 2   | Tab bar overflows a 320 px screen by 5 px                                                                          | Medium   | 15 of 25 states at 320 px had elements past the viewport           | `minmax(0, 1fr)` columns, less side padding                                                                                                                               | 0 states with clipped elements, at all six viewports                                                                                                                                                                 |
| 3   | Touch targets under 48 px: "See history" link (40 px), History menu chips (40 px), landing language toggle (44 px) | Medium   | 144 instances over 150 captures                                    | Raised to `--tap-min` (48 px)                                                                                                                                             | 18 instances left; all are visually hidden radio or file inputs whose label or button is at least 48 px (checked on the live page)                                                                                   |
| 4   | `--line-strong` border colour is 2.73:1 on the cream page, below the 3:1 for component borders                     | Medium   | `npm run contrast` failed one pair                                 | `#8c959f` to `#7f8993` (3.20:1 on cream, 3.56:1 on white)                                                                                                                 | `npm run contrast`: all 18 pairs pass                                                                                                                                                                                |
| 5   | Hard-coded durations, scrim colour and 4 px radius in components                                                   | Low      | `120ms`, `160ms`, `rgb(27 31 35 / 45%)`, `4px` in `components.css` | `--dur-*`, `--ease-*`, `--scrim`, `--radius-xs`                                                                                                                           | 0 literal durations; the only literal colours left are the logo and app-icon fills (brand artwork also rendered to PNG)                                                                                              |
| 6   | Every screen has the same document title "FOODOO"; no focus or scroll reset after navigating                       | Medium   | code: `document.title` never set                                   | `Screen` sets "Name · FOODOO", scrolls to the top and focuses the `h1` after a link navigation                                                                            | checked in Chromium: after clicking History from a page scrolled 400 px, title "History · FOODOO", `scrollY` 0, focus on the `h1`                                                                                    |
| 7   | No safe-area handling, no `viewport-fit=cover`                                                                     | Low      | code                                                               | `env(safe-area-inset-*)` on tab bar, toast, action bar and screen edges                                                                                                   | not testable without a notched device (see limitations)                                                                                                                                                              |
| 8   | Register is one column on desktop; today's sales sit far below the tiles                                           | Low      | `docs/ui/before/1280x800/25-register-cart.png`                     | Two panels at 1024 px and wider, side panel sticky                                                                                                                        | `docs/ui/after/1280x800/25-register-cart.png`                                                                                                                                                                        |
| 9   | In the new side panel the "Transactions" label overflowed its box (found by looking at the after screenshot)       | Low      | `after` screenshot of the first fix                                | Two equal columns in `.register__side`, `overflow-wrap` on labels                                                                                                         | `docs/ui/after/1280x800/25-register-cart.png`                                                                                                                                                                        |
| 10  | No cross-screen motion                                                                                             | Low      | none present                                                       | 160 ms opacity cross-fade through View Transitions on tab and sidebar links, only when the browser supports it and reduced motion is off; otherwise the change is instant | code in `src/app/viewTransition.ts`; Chromium has the API, so the e2e runs and the browser check above went through the transition path. The instant fallback (no API, or reduced motion) is written but has no test |

Not found: horizontal scroll at any of the five required viewports (0 before, 0 after), and text below the contrast threshold (0 after; the scanner was added after the before capture, so there is no before number).

## 4. Numbers, before and after

| Measure                                               | Before          | After                                               |
| ----------------------------------------------------- | --------------- | --------------------------------------------------- |
| Screenshots                                           | 150             | 150                                                 |
| States with horizontal page scroll                    | 0               | 0                                                   |
| States with elements past the viewport (incl. 320 px) | 15              | 0                                                   |
| Interactive targets under 48 px (instances)           | 144             | 18 (hidden inputs only, see finding 3)              |
| Distinct font sizes                                   | 13              | 8                                                   |
| Low-contrast text found by the runtime scan           | not measured    | 0                                                   |
| `npm run contrast` pairs failing                      | 1 of 18         | 0 of 18                                             |
| jest-axe serious or critical violations               | no test existed | 0 on 9 screens, plus a control case that is flagged |
| Unit tests                                            | 384             | 394 (10 new axe tests)                              |
| e2e tests                                             | 9               | 9, online and offline loop green                    |

Bundle, from `vite build`:

| Asset                              | Before                        | After                         |
| ---------------------------------- | ----------------------------- | ----------------------------- |
| Main JS                            | 360.94 kB raw, 116.97 kB gzip | 361.03 kB raw, 116.99 kB gzip |
| CSS                                | 28.88 kB raw, 5.58 kB gzip    | 31.26 kB raw, 6.03 kB gzip    |
| Font (Space Grotesk, latin, woff2) | 21.8 KB                       | 21.8 KB                       |
| Added JS                           |                               | 0.02 kB gzip (budget 15 KB)   |
| CSS total                          |                               | 6.03 kB gzip (budget 30 KB)   |

Lighthouse 12.8.2, mobile preset (simulated Slow 4G, 4x CPU slowdown), production build, same machine and same script. Full tables: `docs/ui/lighthouse-before.md` and `docs/ui/lighthouse-after.md`.

| Page (mobile)       | Accessibility | Best practices | Performance before | Performance after | LCP before | LCP after |
| ------------------- | ------------- | -------------- | ------------------ | ----------------- | ---------- | --------- |
| / first visit, cold | 100 / 100     | 100 / 100      | 98                 | 98                | 2.14 s     | 2.04 s    |
| /today              | 100 / 100     | 100 / 100      | 100                | 97                | 0.29 s     | 0.42 s    |
| /plan               | 100 / 100     | 100 / 100      | 89                 | 98                | 0.74 s     | 0.37 s    |
| /service            | 100 / 100     | 100 / 100      | 100                | 95                | 0.26 s     | 0.36 s    |
| /how                | 100 / 100     | 100 / 100      | 98                 | 95                | 0.26 s     | 0.34 s    |

Read these with care. The per-page Performance scores move by up to 11 points between two runs of the same build (the old build's `/plan` mobile scored 98 in the earlier `docs/LIGHTHOUSE.md` and 89 in my run), so the differences above are run-to-run noise, not a regression and not an improvement. The budgets are met for Accessibility (at least 95), Best Practices (at least 95), Performance (at least 90) and the installability check. **One budget is missed:** the cold first-visit LCP is 2.04 s against a 2.0 s target (it was 2.14 s before). It is dominated by downloading and running the 117 kB gzip main script on simulated Slow 4G. CLS was not reported by the script; it was not measured separately.

## 5. Component and state coverage

The base components already existed (`Button`, `Stepper`, `Sheet`, `Toast`, `EmptyState`, `StatTile`, `Sticker`, `TabBar`, `Sidebar`, icons, the SVG charts and stock bar). They were refined through tokens rather than rebuilt. Hover, focus-visible, pressed and disabled states are defined in `components.css`; empty and error states were captured in the screenshots (empty setup, menu sheet errors, empty cart, unplanned day). No component was replaced, so the existing component tests still cover them.

## 6. Limitations

- No physical device was used. Safe-area insets, the real Android keyboard, and the View Transitions animation itself were not seen on a phone. The e2e run exercises the animated path in Chromium only.
- Large system font size was not simulated beyond the 320 px width and the 8-step font scale. This is not verified.
- Animation frame rate under 4x CPU slowdown was not profiled separately. The only animations are a 160 ms opacity fade and the toast's 16 px slide, both on `transform` and `opacity`. No frame-rate measurement was made.
- `@fontsource-variable` was not added: the font is already self-hosted and preloaded (21.8 KB), and a second copy would add a dependency and bytes (D-093). The fallback `size-adjust` of 108% was measured from one sample string, not from font metric tables.
- `jest-axe` runs in jsdom, which has no layout, so its `color-contrast` rule is switched off; contrast is covered by `npm run contrast` and the runtime scan.
- The runtime contrast scan skips text over gradients or images (there are none in the app) and has no "before" result.
- Screenshots of full pages show the fixed tab bar and sticky bars in the middle of long pages. That is how a full-page capture works, not a layout fault.
- Copy: the Bahasa Indonesia strings were read in full for tone and left as they are.
- Roughly 24 MB of screenshots are committed under `docs/ui/`. Delete `docs/ui/before` and `docs/ui/after` and regenerate with `npm run ui:shots -- docs/ui/after http://localhost:4173 --with-320` if the repository should stay small.

## 7. How to reproduce

```
npm run check
npm run e2e
npm run contrast
npm run build && npm run preview
npm run ui:shots -- docs/ui/after http://localhost:4173 --with-320
npm run lighthouse
```

Dependencies were installed with `npm ci --registry=https://registry.npmmirror.com` because `registry.npmjs.org` was unreachable on the build machine; the lockfile integrity hashes were still checked.

## 8. Second pass (2026-11-26, D-094)

"Before" is the build at the start of this session; "after" is the final build. Both were measured on the same machine. `docs/ui/after/` now shows this pass; `docs/ui/before/` is still the original from 2026-11-25.

### Findings

| #   | Finding                                                                                                      | Severity | Fix                                                       |
| --- | ------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------- |
| 11  | History scrolled sideways on phones (page 478 px wide). Section 4 reported 0 because the detector was faulty | High     | Hidden table wrapped in a `div`; detector fixed           |
| 12  | Type sizes in `px` ignored the browser's text size setting                                                   | Medium   | Type tokens in `rem`; layouts adjusted for 200% at 320 px |
| 13  | The landing page was 335 px wide at 320 px                                                                   | Medium   | Header and language choice wrap                           |
| 14  | The Today screen lacked the infinity loop that `DESIGN.md` 5.2 describes                                     | Medium   | Loop graphic added                                        |
| 15  | Little motion or depth; screens felt flat                                                                    | Low      | `motion.css`, soft shadow, larger radii, tab pill         |
| 16  | Unit tests timed out intermittently on a busy machine                                                        | Medium   | Half the cores for Vitest                                 |

### Numbers

| Measure                                         | Before             | After     |
| ----------------------------------------------- | ------------------ | --------- |
| Unit tests                                      | 394                | 398       |
| e2e tests                                       | 9                  | 13        |
| Screens scrolling sideways at 320 px, 100% text | 2 (History, About) | 0         |
| jest-axe serious or critical violations         | 0                  | 0         |
| `npm run contrast`                              | not re-run         | all pass  |
| Page JavaScript, all chunks, gzip               | 154.03 KB          | 154.23 KB |
| CSS, gzip                                       | 5.85 KB            | 6.59 KB   |
| Font file                                       | 22,288 bytes       | unchanged |
| Cold load FCP, median of 5                      | 1192 ms            | 1196 ms   |
| Cold load LCP, median of 5                      | 1280 ms            | 1284 ms   |
| Layout shift (cold load and a demo session)     | 0.0000             | 0.0000    |
| Running animations with reduced motion          | 0                  | 0         |

Screenshot scan of the final build (150 captures): 0 with horizontal scroll, 0 with clipped elements, 0 low-contrast texts, 18 targets under 48 px (the same hidden inputs as finding 3). Font sizes seen: 12, 12.8 (tab labels at 320 px), 14, 16, 20, 24, 28, 32 and 44 px.

The FCP, LCP, layout shift and frame figures come from a one-off Playwright script (Chromium, 390 px, 150 ms latency, 1.6 Mbps, 4x CPU slowdown), which is not in the repository. They are **not** comparable with the Lighthouse figures in section 4.

Frame timing with 4x CPU slowdown (longest of the 59 frames after a tap): across repeated runs the old build ranged from 18 to 93 ms and the new one from 17 to 113 ms. The first visit to Plan and History was slowest in both. The spread between runs is larger than any difference between builds.

### Not done

- **Lighthouse was not re-run.** `registry.npmjs.org` was unreachable, and fetching `lighthouse@12.8.2` from a mirror was not permitted in this session. Section 4 and the README table describe the build before this pass. The 2.0 s cold LCP budget is therefore still unconfirmed.
- No physical phone was used.
