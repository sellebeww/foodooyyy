// src/i18n/caseText.ts
import type { CaseFacts, CaseMenuFact } from "../demo/cases.ts";
import type { DayHours } from "../domain/time.ts";
import { formatRupiah } from "./format.ts";
import type { MessageKey, MessageParams, Translate } from "./index.ts";
import { renderReason } from "./reason.ts";

function weekdayName(t: Translate, weekday: number): string {
  const index = ((weekday % 7) + 7) % 7;
  return t(`weekday.plural.${index}` as MessageKey);
}

function menuParams(
  t: Translate,
  fact: CaseMenuFact | null,
  weekday: number,
  suffix: string,
): MessageParams {
  if (fact === null) {
    return {
      [`menu${suffix}`]: "",
      [`usual${suffix}`]: 0,
      [`qty${suffix}`]: 0,
      [`why${suffix}`]: "",
      [`soldOut${suffix}`]: 0,
      [`leftover${suffix}`]: 0,
      [`obs${suffix}`]: 0,
      [`ratio${suffix}`]: 0,
      [`salvage${suffix}`]: formatRupiah(0),
    };
  }
  return {
    [`menu${suffix}`]: fact.name,
    [`usual${suffix}`]: fact.usual,
    [`qty${suffix}`]: fact.qty,
    [`why${suffix}`]: renderReason(t, fact.reason, {
      weekday,
      usualQty: fact.usual,
    }),
    [`soldOut${suffix}`]: fact.reason.soldOutDays,
    [`leftover${suffix}`]: fact.reason.leftoverDays,
    [`obs${suffix}`]: fact.reason.observations,
    [`ratio${suffix}`]: Math.round(fact.ratio * 100),
    [`salvage${suffix}`]: formatRupiah(fact.salvage),
  };
}

// Every number in the case texts comes from the stored stall through here,
// so the guide cannot disagree with the plan screen.
export function caseParams(
  t: Translate,
  facts: CaseFacts,
  hours: DayHours,
  weekday: number,
): MessageParams {
  return {
    ...menuParams(t, facts.primary, weekday, ""),
    ...menuParams(t, facts.secondary, weekday, "2"),
    ...menuParams(t, facts.extra, weekday, "3"),
    weekday: weekdayName(t, weekday),
    hiDay: weekdayName(t, facts.weekdayHigh.weekday),
    hiQty: facts.weekdayHigh.qty,
    loDay: weekdayName(t, facts.weekdayLow.weekday),
    loQty: facts.weekdayLow.qty,
    open: hours.openAt,
    close: hours.closeAt,
    days: facts.closedDays,
  };
}
