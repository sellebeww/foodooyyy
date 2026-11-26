// tests/i18n/messages.test.ts
import { describe, expect, it } from "vitest";
import { en } from "../../src/i18n/en.ts";
import { id } from "../../src/i18n/id.ts";
import {
  readStoredLanguage,
  t,
  translate,
  writeStoredLanguage,
} from "../../src/i18n/index.ts";

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("messages", () => {
  it("has identical keys in English and Bahasa Indonesia", () => {
    expect(Object.keys(id).sort()).toEqual(Object.keys(en).sort());
  });

  it("has no empty strings", () => {
    for (const value of [...Object.values(en), ...Object.values(id)]) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses the same placeholders in both languages", () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(id[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it("defaults to English, translates to Bahasa Indonesia and fills placeholders", () => {
    expect(t("welcome.start")).toBe("Start setup");
    expect(translate("id", "welcome.start")).toBe("Mulai pengaturan");
    expect(t("setup.step", { step: 1, total: 2 })).toBe("Step 1 of 2");
    expect(t("setup.step", { step: 1 })).toBe("Step 1 of {total}");
  });
});

describe("language storage", () => {
  it("reads a stored language and falls back to English", () => {
    expect(readStoredLanguage({ getItem: () => "id" })).toBe("id");
    expect(readStoredLanguage({ getItem: () => "fr" })).toBe("en");
    expect(readStoredLanguage({ getItem: () => null })).toBe("en");
    expect(readStoredLanguage(undefined)).toBe("en");
    expect(
      readStoredLanguage({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toBe("en");
  });

  it("writes the language and ignores a blocked storage", () => {
    const saved: Record<string, string> = {};
    writeStoredLanguage(
      {
        setItem: (key, value) => {
          saved[key] = value;
        },
      },
      "id",
    );
    expect(saved).toEqual({ "foodoo.language": "id" });
    expect(() =>
      writeStoredLanguage(
        {
          setItem: () => {
            throw new Error("blocked");
          },
        },
        "en",
      ),
    ).not.toThrow();
  });
});
