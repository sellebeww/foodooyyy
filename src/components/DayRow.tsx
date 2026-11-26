// src/components/DayRow.tsx
import { Link } from "react-router-dom";
import type { DayListItem } from "../domain/metrics.ts";
import { formatLongDate } from "../i18n/format.ts";
import { useI18n } from "../i18n/index.ts";
import { ChevronIcon } from "./icons/ChevronIcon.tsx";
import { StatusBadge } from "./StatusBadge.tsx";

interface DayRowProps {
  day: DayListItem;
}

export function DayRow({ day }: DayRowProps) {
  const { t, language } = useI18n();
  return (
    <Link className="day-row" to={`/day/${day.date}`}>
      <span className="day-row__main">
        <span className="day-row__date">
          {formatLongDate(day.date, language)}
        </span>
        <span className="day-row__meta">
          {t("history.days.meta", {
            portions: day.portions,
            soldOut: day.soldOutCount,
          })}
        </span>
      </span>
      <StatusBadge closed={day.closed} unusual={day.unusual} />
      <span className="day-row__chevron" aria-hidden="true">
        <ChevronIcon />
      </span>
    </Link>
  );
}
