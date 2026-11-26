// tests/i18n/format.test.ts
import { describe, expect, it } from "vitest";
import {
  formatDelta,
  formatLongDate,
  formatRupiah,
  parseWholeInput,
} from "../../src/i18n/format.ts";

describe("format", () => {
  it("formats rupiah with dot thousands separators", () => {
    expect(formatRupiah(8000)).toBe("Rp 8.000");
    expect(formatRupiah(78053000)).toBe("Rp 78.053.000");
    expect(formatRupiah(0)).toBe("Rp 0");
    expect(formatRupiah(-1500)).toBe("Rp -1.500");
  });

  it("signs a delta and uses a true minus sign", () => {
    expect(formatDelta(5)).toBe("+5");
    expect(formatDelta(-3)).toBe("−3");
    expect(formatDelta(0)).toBe("0");
  });

  it("parses whole numbers and accepts dots and spaces as separators", () => {
    expect(parseWholeInput("8000")).toBe(8000);
    expect(parseWholeInput("8.000")).toBe(8000);
    expect(parseWholeInput(" 12 000 ")).toBe(12000);
    expect(parseWholeInput("")).toBeNaN();
    expect(parseWholeInput("1,5")).toBeNaN();
    expect(parseWholeInput("-4")).toBeNaN();
  });

  it("formats a long date in each language", () => {
    expect(formatLongDate("2026-03-02", "en")).toBe("Monday 2 March");
    expect(formatLongDate("2026-03-02", "id")).toBe("Senin, 2 Maret");
  });
});
