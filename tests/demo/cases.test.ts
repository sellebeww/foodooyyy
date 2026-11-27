// tests/demo/cases.test.ts
import { describe, expect, it } from "vitest";
import {
  DEMO_CASES,
  caseFacts,
  caseMessageKeys,
  type DemoCase,
} from "../../src/demo/cases.ts";
import { DEMO_CATALOG, DEMO_MOMENTS } from "../../src/demo/catalog.ts";
import { buildDemoRecords } from "../../src/demo/seed.ts";
import { demoScenario } from "../../src/demo/scenarios.ts";
import { suggestAll } from "../../src/domain/plan.ts";
import { spansMidnight, weekdayOf } from "../../src/domain/time.ts";
import { en } from "../../src/i18n/en.ts";
import { id } from "../../src/i18n/id.ts";
import { caseParams } from "../../src/i18n/caseText.ts";
import {
  translate,
  type Language,
  type MessageKey,
  type MessageParams,
} from "../../src/i18n/index.ts";
import { renderReason } from "../../src/i18n/reason.ts";

// 2026-12-01 is the day the numbers in docs/DEMO_SCENARIOS.md are written for.
const TODAY = "2026-12-01";
const WEEKDAY = weekdayOf(TODAY);

function setup(scenario: 1 | 2 | 3 | 4) {
  const records = buildDemoRecords(TODAY, scenario);
  const history = { days: records.days, menuDays: records.menuDays };
  const facts = caseFacts(
    DEMO_CASES[scenario],
    records.menus,
    history,
    WEEKDAY,
  );
  return { records, history, facts };
}

describe("demo cases", () => {
  it("has one case per demo stall, and every menu it names exists in that stall", () => {
    expect(Object.keys(DEMO_CASES).map(Number)).toEqual(
      DEMO_CATALOG.map((entry) => entry.id),
    );
    for (const entry of DEMO_CATALOG) {
      const demoCase = DEMO_CASES[entry.id];
      const ids = demoScenario(entry.id).menus.map((menu) => menu.id);
      const named = [demoCase.primary, demoCase.secondary, demoCase.extra];
      for (const menuId of named) {
        if (menuId !== null) {
          expect(ids, `${String(entry.id)} ${menuId}`).toContain(menuId);
        }
      }
      expect(demoCase.primary).not.toBe(demoCase.secondary);
    }
  });

  it("reports the same suggestions as the plan screen (suggestAll on the stored history)", () => {
    for (const entry of DEMO_CATALOG) {
      const { records, history, facts } = setup(entry.id);
      expect(facts).not.toBeNull();
      const planned = suggestAll(
        records.menus,
        WEEKDAY,
        history.menuDays,
        history.days,
      );
      for (const fact of [facts?.primary, facts?.secondary, facts?.extra]) {
        if (fact === null || fact === undefined) {
          continue;
        }
        const same = planned.find((item) => item.menuId === fact.menuId);
        expect(same?.qty, fact.menuId).toBe(fact.qty);
        expect(same?.reason, fact.menuId).toEqual(fact.reason);
      }
    }
  });

  it("stall 1 shows both directions: a menu that sells out goes up, one with leftovers goes down", () => {
    const { facts } = setup(1);
    expect(facts?.primary.name).toBe("Nasi Uduk");
    expect(facts?.primary.qty).toBe(48);
    expect(facts?.primary.qty).toBeGreaterThan(facts?.primary.usual ?? 0);
    expect(facts?.primary.reason.soldOutDays).toBeGreaterThan(
      facts?.primary.reason.leftoverDays ?? 0,
    );
    expect(facts?.secondary.name).toBe("Ayam Goreng");
    expect(facts?.secondary.qty).toBe(22);
    expect(facts?.secondary.qty).toBeLessThan(facts?.secondary.usual ?? 0);
    expect(facts?.secondary.reason.leftoverDays).toBeGreaterThan(
      facts?.secondary.reason.soldOutDays ?? 0,
    );
  });

  it("stall 2 gives the weekend a lower number than the busiest weekday", () => {
    const { facts } = setup(2);
    expect(facts?.primary.qty).toBe(48);
    expect(facts?.secondary.qty).toBe(23);
    expect(facts?.weekdayHigh.qty).toBeGreaterThan(facts?.weekdayLow.qty ?? 0);
    expect([0, 6]).toContain(facts?.weekdayLow.weekday);
    expect([1, 2, 3, 4, 5]).toContain(facts?.weekdayHigh.weekday);
  });

  it("stall 3 crosses midnight", () => {
    const { records, facts } = setup(3);
    expect(spansMidnight(records.stall.settings)).toBe(true);
    expect(facts?.primary.qty).toBe(63);
    expect(facts?.secondary.qty).toBe(43);
  });

  it("stall 4 is a cold start in both directions and the extra menu has a salvage value", () => {
    const { facts } = setup(4);
    expect(facts?.closedDays).toBe(4);
    expect(facts?.primary.name).toBe("Lontong Sayur");
    expect(facts?.primary.reason.code).toBe("cold-start-up");
    expect(facts?.primary.qty).toBe(17);
    expect(facts?.secondary.name).toBe("Nasi Campur");
    expect(facts?.secondary.reason.code).toBe("cold-start-down");
    expect(facts?.secondary.qty).toBe(36);
    expect(facts?.extra?.name).toBe("Bakwan");
    expect(facts?.extra?.salvage).toBe(500);
    expect(facts?.extra?.ratio).toBeCloseTo(0.8, 5);
  });

  it("falls back to the first active menus when the named menus are archived or missing", () => {
    const { records, history } = setup(1);
    const menus = records.menus.map((menu) =>
      menu.id === "nasi-uduk" ? { ...menu, archived: true } : menu,
    );
    const facts = caseFacts(DEMO_CASES[1], menus, history, WEEKDAY);
    expect(facts?.primary.menuId).toBe("ayam-goreng");
    expect(facts?.secondary.menuId).toBe("sayur-lodeh");

    const lone: DemoCase = { id: 1, primary: "x", secondary: "y", extra: "z" };
    const onlyOne = caseFacts(
      lone,
      records.menus.slice(0, 1),
      history,
      WEEKDAY,
    );
    expect(onlyOne?.primary.menuId).toBe("nasi-uduk");
    expect(onlyOne?.secondary.menuId).toBe("nasi-uduk");
    expect(onlyOne?.extra).toBeNull();
  });

  it("returns nothing when no menu is active", () => {
    const { records, history } = setup(1);
    const archived = records.menus.map((menu) => ({ ...menu, archived: true }));
    expect(caseFacts(DEMO_CASES[1], archived, history, WEEKDAY)).toBeNull();
    expect(caseFacts(DEMO_CASES[1], [], history, WEEKDAY)).toBeNull();
  });
});

describe("case texts", () => {
  const languages: readonly Language[] = ["en", "id"];

  it("exist in both languages for every stall and every moment", () => {
    for (const entry of DEMO_CATALOG) {
      const keys = caseMessageKeys(entry.id);
      expect(keys).toHaveLength(1 + DEMO_MOMENTS.length * 2 + 1);
      for (const key of keys) {
        expect(en[key], key).toBeTruthy();
        expect(id[key], key).toBeTruthy();
      }
    }
  });

  it("have no unfilled placeholder once the facts are filled in", () => {
    for (const entry of DEMO_CATALOG) {
      const { records, facts } = setup(entry.id);
      if (facts === null) {
        throw new Error("facts missing");
      }
      for (const language of languages) {
        const params = caseParams(
          (key, extra) => translate(language, key, extra),
          facts,
          records.stall.settings,
          WEEKDAY,
        );
        for (const key of caseMessageKeys(entry.id)) {
          const text = translate(language, key, params);
          expect(text, `${language} ${key}`).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });

  it("quote the same reason sentence the plan card shows", () => {
    const { records, facts } = setup(1);
    if (facts === null) {
      throw new Error("facts missing");
    }
    const say = (key: MessageKey, extra?: MessageParams) =>
      translate("en", key, extra);
    const params = caseParams(say, facts, records.stall.settings, WEEKDAY);
    expect(params["why"]).toBe(
      renderReason(say, facts.primary.reason, {
        weekday: WEEKDAY,
        usualQty: facts.primary.usual,
      }),
    );
    expect(String(params["why"])).toContain("Sold out on");
    expect(String(params["why"])).toContain("Tuesdays");
  });
});
