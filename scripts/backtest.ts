// scripts/backtest.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  DEMO_MENUS,
  DEMO_SETTINGS,
  DEMO_TRUE_MEANS,
  WEEKDAY_FACTORS,
  createRng,
  drawDay,
  observeOutcome,
  toMenuDay,
} from "../src/demo/generator.ts";
import type { DayDraw, Outcome } from "../src/demo/generator.ts";
import { suggestQty } from "../src/domain/suggest.ts";
import { addDays } from "../src/domain/time.ts";
import type { DayRecord, Menu, MenuDay } from "../src/domain/types.ts";

const SEEDS = ["backtest-1", "backtest-2", "backtest-3"];
const WEEKS = 12;
const FIRST_SCORED_WEEK = 3;
const START_DATE = "2026-01-05";
const DAYS = WEEKS * 7;
const FIRST_SCORED_DAY = (FIRST_SCORED_WEEK - 1) * 7;
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const rootUrl = new URL("../", import.meta.url);
const backtestPath = fileURLToPath(new URL("docs/BACKTEST.md", rootUrl));
const readmePath = fileURLToPath(new URL("README.md", rootUrl));
const MARKER_START = "<!-- backtest:start -->";
const MARKER_END = "<!-- backtest:end -->";

const BASELINE = "Baseline";
const FOODOO = "FOODOO";
const NO_CORRECTION = "FOODOO without sell-out correction";
type Policy = typeof BASELINE | typeof FOODOO | typeof NO_CORRECTION;
const POLICIES: readonly Policy[] = [BASELINE, FOODOO, NO_CORRECTION];

interface Totals {
  leftover: number;
  lostSales: number;
  sellOutDays: number;
  profit: number;
  menuDays: number;
  estimatorErrors: number[];
  naiveErrors: number[];
}

interface PolicyResult {
  total: Totals;
  byMenu: Record<string, Totals>;
}

type SeedResult = Record<Policy, PolicyResult>;

interface History {
  days: DayRecord[];
  menuDays: MenuDay[];
}

function emptyTotals(): Totals {
  return {
    leftover: 0,
    lostSales: 0,
    sellOutDays: 0,
    profit: 0,
    menuDays: 0,
    estimatorErrors: [],
    naiveErrors: [],
  };
}

function emptyResult(): PolicyResult {
  const byMenu: Record<string, Totals> = {};
  for (const menu of DEMO_MENUS) {
    byMenu[menu.id] = emptyTotals();
  }
  return { total: emptyTotals(), byMenu };
}

function addInto(target: Totals, part: Totals): void {
  target.leftover += part.leftover;
  target.lostSales += part.lostSales;
  target.sellOutDays += part.sellOutDays;
  target.profit += part.profit;
  target.menuDays += part.menuDays;
  target.estimatorErrors.push(...part.estimatorErrors);
  target.naiveErrors.push(...part.naiveErrors);
}

function score(
  totals: Totals,
  menu: Menu,
  demand: number,
  outcome: Outcome,
  estimated: MenuDay,
): void {
  totals.menuDays += 1;
  totals.leftover += outcome.leftover;
  totals.lostSales += Math.max(0, demand - outcome.cooked);
  totals.sellOutDays += outcome.soldOutAt === null ? 0 : 1;
  totals.profit += outcome.sold * menu.price - outcome.cooked * menu.cost;
  if (outcome.soldOutAt !== null) {
    totals.estimatorErrors.push(
      Math.abs((estimated.estimatedDemand as number) - demand),
    );
    totals.naiveErrors.push(Math.abs(outcome.sold - demand));
  }
}

function recordForHistory(
  policy: Policy,
  outcome: Outcome,
  estimated: MenuDay,
): MenuDay {
  if (policy === NO_CORRECTION && outcome.soldOutAt !== null) {
    return {
      ...estimated,
      estimatedDemand: outcome.sold,
      demandIsEstimate: false,
    };
  }
  return estimated;
}

function simulate(seed: string): SeedResult {
  const rng = createRng(seed);
  const draws: DayDraw[] = [];
  for (let index = 0; index < DAYS; index += 1) {
    draws.push(
      drawDay(rng, addDays(START_DATE, index), DEMO_MENUS, DEMO_SETTINGS),
    );
  }

  const results = {} as SeedResult;
  const histories = {} as Record<Policy, History>;
  for (const policy of POLICIES) {
    results[policy] = emptyResult();
    histories[policy] = { days: [], menuDays: [] };
  }

  draws.forEach((draw, dayIndex) => {
    const scored = dayIndex >= FIRST_SCORED_DAY;
    for (const policy of POLICIES) {
      const history = histories[policy];
      const todays: MenuDay[] = [];
      for (const menu of DEMO_MENUS) {
        const demand = draw.demand[menu.id] as number;
        const arrivals = draw.arrivals[menu.id] as number[];
        const suggestion =
          policy === BASELINE
            ? null
            : suggestQty(menu, draw.weekday, history.menuDays, history.days);
        const cooked = suggestion === null ? menu.usualQty : suggestion.qty;
        const outcome = observeOutcome(cooked, demand, arrivals);
        const estimated = toMenuDay(
          draw.date,
          menu.id,
          outcome,
          DEMO_SETTINGS,
          {
            suggestedQty: suggestion === null ? null : suggestion.qty,
            reason: suggestion === null ? null : suggestion.reason,
          },
        );
        todays.push(recordForHistory(policy, outcome, estimated));
        if (scored) {
          const result = results[policy];
          score(result.total, menu, demand, outcome, estimated);
          score(
            result.byMenu[menu.id] as Totals,
            menu,
            demand,
            outcome,
            estimated,
          );
        }
      }
      history.menuDays.push(...todays);
      history.days.push({
        date: draw.date,
        weekday: draw.weekday,
        unusual: draw.unusual,
        closed: true,
      });
    }
  });

  return results;
}

function formatRp(value: number): string {
  const digits = String(Math.abs(Math.round(value))).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ".",
  );
  return `${value < 0 ? "-" : ""}Rp ${digits}`;
}

function signed(value: number, digits: number): string {
  const text = value.toFixed(digits);
  return value > 0 ? `+${text}` : text;
}

function mean(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function table(headers: string[], rows: string[][]): string {
  const widths = headers.map((header, column) =>
    Math.max(
      3,
      header.length,
      ...rows.map((row) => (row[column] as string).length),
    ),
  );
  const line = (cells: string[]): string =>
    `| ${cells.map((cell, column) => cell.padEnd(widths[column] as number)).join(" | ")} |`;
  return [
    line(headers),
    line(widths.map((width) => "-".repeat(width))),
    ...rows.map(line),
  ].join("\n");
}

function sumTotals(parts: readonly Totals[]): Totals {
  const total = emptyTotals();
  for (const part of parts) {
    addInto(total, part);
  }
  return total;
}

function comparisonRow(
  label: string,
  reference: number,
  other: number,
  lowerIsBetter: boolean,
  format: (value: number) => string,
): string[] {
  const change = other - reference;
  const percent =
    reference === 0 ? "n/a" : `${signed((change / reference) * 100, 1)}%`;
  let verdict = "Same";
  if (change !== 0) {
    verdict = change < 0 === lowerIsBetter ? "FOODOO better" : "FOODOO worse";
  }
  return [label, format(reference), format(other), percent, verdict];
}

function comparisonTable(
  referenceLabel: string,
  reference: Totals,
  other: Totals,
): string {
  const integer = (value: number): string => String(value);
  return table(
    ["Metric", referenceLabel, "FOODOO", "Change", "Verdict"],
    [
      comparisonRow(
        "Leftover portions",
        reference.leftover,
        other.leftover,
        true,
        integer,
      ),
      comparisonRow(
        "Lost sales (portions)",
        reference.lostSales,
        other.lostSales,
        true,
        integer,
      ),
      comparisonRow(
        "Sell-out menu-days",
        reference.sellOutDays,
        other.sellOutDays,
        true,
        integer,
      ),
      comparisonRow("Profit", reference.profit, other.profit, false, formatRp),
    ],
  );
}

function main(): void {
  const results = SEEDS.map(simulate);
  const overall = {} as Record<Policy, Totals>;
  for (const policy of POLICIES) {
    overall[policy] = sumTotals(results.map((result) => result[policy].total));
  }
  const baseline = overall[BASELINE];
  const foodoo = overall[FOODOO];
  const noCorrection = overall[NO_CORRECTION];

  const summary = comparisonTable(BASELINE, baseline, foodoo);
  const diagnostic = comparisonTable(
    "Without correction",
    noCorrection,
    foodoo,
  );

  const estimator = table(
    ["Policy", "Sold-out menu-days", "Estimator MAE", "Sales = demand MAE"],
    [BASELINE, FOODOO].map((policy) => {
      const totals = overall[policy as Policy];
      const count = totals.estimatorErrors.length;
      return [
        policy,
        String(count),
        count === 0 ? "n/a" : mean(totals.estimatorErrors).toFixed(2),
        count === 0 ? "n/a" : mean(totals.naiveErrors).toFixed(2),
      ];
    }),
  );

  const byMenu = table(
    [
      "Menu",
      "Critical ratio",
      "Policy",
      "Leftover",
      "Lost sales",
      "Sell-out menu-days",
      "Profit",
    ],
    DEMO_MENUS.flatMap((menu) =>
      POLICIES.map((policy) => {
        const totals = sumTotals(
          results.map((result) => result[policy].byMenu[menu.id] as Totals),
        );
        return [
          menu.name,
          ((menu.price - menu.cost) / (menu.price - menu.salvage)).toFixed(4),
          policy,
          String(totals.leftover),
          String(totals.lostSales),
          String(totals.sellOutDays),
          formatRp(totals.profit),
        ];
      }),
    ),
  );

  const perSeed = table(
    [
      "Seed",
      "Policy",
      "Leftover",
      "Lost sales",
      "Sell-out menu-days",
      "Profit",
    ],
    SEEDS.flatMap((seed, index) =>
      POLICIES.map((policy) => {
        const totals = (results[index] as SeedResult)[policy].total;
        return [
          seed,
          policy,
          String(totals.leftover),
          String(totals.lostSales),
          String(totals.sellOutDays),
          formatRp(totals.profit),
        ];
      }),
    ),
  );

  const menus = table(
    ["Menu", "Price", "Cost", "Usual quantity", "True mean demand"],
    DEMO_MENUS.map((menu) => [
      menu.name,
      formatRp(menu.price),
      formatRp(menu.cost),
      String(menu.usualQty),
      String(DEMO_TRUE_MEANS[menu.id] as number),
    ]),
  );

  const parameters = table(
    ["Parameter", "Value"],
    [
      ["Seeds", SEEDS.join(", ")],
      ["Simulated weeks per seed", String(WEEKS)],
      ["Scored weeks", `${FIRST_SCORED_WEEK} to ${WEEKS}`],
      ["Menu-days scored per policy", String(baseline.menuDays)],
      ["First simulated day", `${START_DATE} (Monday)`],
      [
        "Weekday factors",
        WEEKDAY_FACTORS.map(
          (factor, index) =>
            `${WEEKDAY_NAMES[index] as string} ${factor.toFixed(2)}`,
        ).join(", "),
      ],
      ["Opening hours", `${DEMO_SETTINGS.openAt} to ${DEMO_SETTINGS.closeAt}`],
      [
        "Busy-hour weights",
        Object.entries(DEMO_SETTINGS.busyProfile)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([hour, weight]) => `${hour}:${weight}`)
          .join(", "),
      ],
      ["Baseline policy", "Cook the usual quantity every day"],
      [
        "FOODOO policy",
        "Cook suggestQty using only observed sales, sell-out times and leftovers",
      ],
      [
        "Diagnostic policy",
        "Same as FOODOO, but a sold-out day is recorded as demand = sales",
      ],
    ],
  );

  const readmeBlock = [
    MARKER_START,
    "",
    "Simulated data only. Generated by `npm run backtest`; see `docs/BACKTEST.md` for parameters, per-menu results and limitations.",
    "",
    summary,
    "",
    "Diagnostic: the same FOODOO rule without the sell-out correction (sold-out days recorded as demand = sales), compared with FOODOO:",
    "",
    diagnostic,
    "",
    "Estimator check (mean absolute error in portions, lower is better):",
    "",
    estimator,
    "",
    MARKER_END,
  ].join("\n");

  const report = `# Backtest report

Generated by \`npm run backtest\`. Do not edit by hand. Re-running the command reproduces this file exactly.

All data is **simulated**. It is not field evidence.

## Method

- Each seed simulates ${WEEKS} weeks of a stall with four menus. True demand is drawn from a Poisson distribution with the menu's mean times a weekday factor. Each customer's arrival hour is drawn with probability proportional to the reference busy-hour weight, with a uniform minute inside that hour.
- A menu sells out at the arrival time of customer number cooked + 1. Otherwise leftover = cooked - demand.
- All policies face exactly the same demand and arrival times on every day (common random numbers).
- **Baseline** cooks the usual quantity every day.
- **FOODOO** cooks \`suggestQty\` using only what the app would have recorded: leftovers, sell-out times and the demand estimate derived from them. It never reads the true demand. It starts with no history, as a new user would, and always cooks exactly its own suggestion.
- **FOODOO without sell-out correction** is a diagnostic, not a product feature. It uses the same rule and inputs, except that a sold-out day is recorded as demand = sales instead of the \`estimateDemand\` result. Comparing it with FOODOO isolates the effect of the sell-out correction.
- Metrics are summed over weeks ${FIRST_SCORED_WEEK} to ${WEEKS} (the first two weeks are warm-up) and over all ${SEEDS.length} seeds.
- Lost sales = true demand - cooked, when positive. Profit = sum of min(demand, cooked) x price - sum of cooked x cost. Leftovers have no salvage value.

## Parameters

${parameters}

${menus}

## Results

${summary}

"Change" is FOODOO relative to Baseline. The verdict is computed from the sign of the change, so a metric where FOODOO does worse is reported as worse.

## Diagnostic: value of the sell-out correction

"Change" is FOODOO relative to the same rule without the sell-out correction.

${diagnostic}

## Estimator check

On menu-days that sold out, the table compares the error of \`estimateDemand\` against true demand with the error of the naive assumption that sales equal demand.

${estimator}

## Results by menu

Summed over all seeds. The critical ratio is (price - cost) / (price - salvage); below 0.5 the rule deliberately cooks below the median demand.

${byMenu}

## Results by seed

${perSeed}

## Limitations

The data is synthetic. The simulated demand model uses the same busy-hour profile that the estimator assumes, so the estimator is tested on a world that matches its own assumptions; real arrival patterns will differ and the busy-hour profile entered by an owner may be wrong. Demand is Poisson with fixed means, with no trends, no weather or events (days flagged unusual are excluded from suggestions but their demand is not shocked), and no menu-to-menu substitution. The sell-out time is modelled at the arrival of customer cooked + 1, which is slightly later than the moment the last portion is actually sold. The baseline is a fixed usual quantity, not a real owner who adjusts by feel, and the simulated FOODOO owner accepts every suggestion without editing. Leftovers have no salvage value and profit ignores all other costs. Only ${SEEDS.length} seeds are used and no confidence intervals are reported. These results show how the rules behave under stated assumptions; they are not evidence of benefit to real stalls. A pilot with real owners is needed for that.
`;

  writeFileSync(backtestPath, report);

  const readme = readFileSync(readmePath, "utf8");
  const start = readme.indexOf(MARKER_START);
  const end = readme.indexOf(MARKER_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("README.md is missing the backtest markers");
  }
  writeFileSync(
    readmePath,
    readme.slice(0, start) +
      readmeBlock +
      readme.slice(end + MARKER_END.length),
  );

  console.log(summary);
  console.log("");
  console.log(diagnostic);
  console.log("");
  console.log(estimator);
}

main();
