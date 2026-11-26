// src/i18n/reason.ts
import type { Reason } from "../domain/types.ts";
import { formatDelta } from "./format.ts";
import type { MessageKey, Translate } from "./index.ts";

export interface ReasonContext {
  weekday: number;
  usualQty: number;
}

function weekdayPluralKey(weekday: number): MessageKey {
  const index = ((weekday % 7) + 7) % 7;
  return `weekday.plural.${index}` as MessageKey;
}

export function renderReason(
  t: Translate,
  reason: Reason,
  context: ReasonContext,
): string {
  const delta = formatDelta(reason.delta);
  switch (reason.code) {
    case "cold-start":
      return t("reason.coldStart", { usualQty: context.usualQty });
    case "cold-start-up":
      return t("reason.coldStartUp", { usualQty: context.usualQty, delta });
    case "cold-start-down":
      return t("reason.coldStartDown", { usualQty: context.usualQty, delta });
    case "history":
      if (reason.soldOutDays > 0) {
        return reason.scope === "weekday"
          ? t("reason.history.soldOutWeekday", {
              soldOut: reason.soldOutDays,
              observations: reason.observations,
              weekdayPlural: t(weekdayPluralKey(context.weekday)),
              delta,
            })
          : t("reason.history.soldOutRecent", {
              soldOut: reason.soldOutDays,
              observations: reason.observations,
              delta,
            });
      }
      if (reason.leftoverDays > 0) {
        return t("reason.history.leftover", {
          leftover: reason.leftoverDays,
          observations: reason.observations,
          delta,
        });
      }
      return t("reason.history.base", { observations: reason.observations });
  }
}
