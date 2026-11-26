// src/i18n/format.ts
import type { ISODate } from "../domain/types.ts";
import type { Language } from "./index.ts";

const LOCALES: Record<Language, string> = { en: "en-GB", id: "id-ID" };
const MINUS = "−";

export function formatThousands(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = String(Math.abs(Math.trunc(value)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRupiah(value: number): string {
  return `Rp ${formatThousands(value)}`;
}

export function formatDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`;
  }
  return delta < 0 ? `${MINUS}${Math.abs(delta)}` : "0";
}

export function parseWholeInput(text: string): number {
  const cleaned = text.replace(/[.\s]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}

export function formatLongDate(date: ISODate, language: Language): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat(LOCALES[language], {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(utc));
}
