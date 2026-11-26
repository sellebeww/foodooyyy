// tests/i18n/reason.test.ts
import { describe, expect, it } from "vitest";
import type { Reason } from "../../src/domain/types.ts";
import {
  translate,
  type Language,
  type Translate,
} from "../../src/i18n/index.ts";
import { renderReason } from "../../src/i18n/reason.ts";

function tr(language: Language): Translate {
  return (key, params) => translate(language, key, params);
}

function reason(overrides: Partial<Reason> = {}): Reason {
  return {
    code: "history",
    scope: "weekday",
    observations: 6,
    soldOutDays: 0,
    leftoverDays: 0,
    delta: 0,
    ...overrides,
  };
}

const monday = { weekday: 1, usualQty: 40 };

describe("renderReason", () => {
  it("names the weekday when the history is same-weekday", () => {
    const text = renderReason(
      tr("en"),
      reason({ soldOutDays: 3, delta: 5 }),
      monday,
    );
    expect(text).toBe("Sold out on 3 of the last 6 Mondays → +5");
    expect(
      renderReason(tr("id"), reason({ soldOutDays: 3, delta: 5 }), monday),
    ).toBe("Habis pada 3 dari 6 hari Senin terakhir → +5");
  });

  it("says days when the history fell back to recent days", () => {
    const text = renderReason(
      tr("en"),
      reason({ scope: "recent", observations: 14, soldOutDays: 2, delta: -1 }),
      monday,
    );
    expect(text).toBe("Sold out on 2 of the last 14 days → −1");
  });

  it("explains leftovers and plain history", () => {
    expect(
      renderReason(tr("en"), reason({ leftoverDays: 4, delta: -3 }), monday),
    ).toBe("Leftovers on 4 of the last 6 days → −3");
    expect(renderReason(tr("en"), reason(), monday)).toBe(
      "Based on the last 6 days",
    );
  });

  it("explains each cold start", () => {
    const cold = { scope: "recent" as const, observations: 3 };
    expect(
      renderReason(tr("en"), reason({ ...cold, code: "cold-start" }), monday),
    ).toBe("Not enough history yet. Starting from your usual 40");
    expect(
      renderReason(
        tr("en"),
        reason({ ...cold, code: "cold-start-up", delta: 4 }),
        monday,
      ),
    ).toBe(
      "Not enough history yet. Starting from your usual 40, sold out last time → +4",
    );
    expect(
      renderReason(
        tr("id"),
        reason({ ...cold, code: "cold-start-down", delta: -4 }),
        monday,
      ),
    ).toBe(
      "Riwayat belum cukup. Mulai dari porsi biasa Anda, 40, terakhir kali ada sisa → −4",
    );
  });

  it("names every weekday from Sunday 0 to Saturday 6", () => {
    const names = [0, 1, 2, 3, 4, 5, 6].map(
      (weekday) =>
        renderReason(tr("en"), reason({ soldOutDays: 1 }), {
          weekday,
          usualQty: 1,
        }).split(" ")[8],
    );
    expect(names).toEqual([
      "Sundays",
      "Mondays",
      "Tuesdays",
      "Wednesdays",
      "Thursdays",
      "Fridays",
      "Saturdays",
    ]);
  });
});
