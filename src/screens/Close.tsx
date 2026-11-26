// src/screens/Close.tsx
import { useId, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useToast } from "../app/toast.ts";
import { useStallStamp } from "../app/useStallStamp.ts";
import { Button } from "../components/Button.tsx";
import { CloseRow } from "../components/CloseRow.tsx";
import { CloseSummary } from "../components/CloseSummary.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { CheckIcon } from "../components/icons/CheckIcon.tsx";
import { Screen } from "../components/Screen.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { SoldOutTimeSheet } from "../components/SoldOutTimeSheet.tsx";
import {
  useDb,
  useHistory,
  useMenus,
  useSales,
  useStall,
  useTodayState,
} from "../db/hooks.ts";
import { canCorrect, closeDay, setSoldOut } from "../db/repositories.ts";
import {
  closeDayRecords,
  incompleteDays,
  tomorrowPlan,
  validateSoldOutTime,
  withClosedDay,
  type CloseEntry,
} from "../domain/close.ts";
import { isCooked } from "../domain/plan.ts";
import {
  dayRevenue,
  leftoverGap,
  modeOf,
  overPlanQty,
  remainingQty,
  CORRECTION_DAYS,
} from "../domain/pos.ts";
import { addDays } from "../domain/time.ts";
import type { HHMM, MenuDay } from "../domain/types.ts";
import { formatDelta, formatLongDate } from "../i18n/format.ts";
import { useI18n, type MessageKey } from "../i18n/index.ts";

export function Close() {
  const { t, language } = useI18n();
  const db = useDb();
  const toast = useToast();
  const stamp = useStallStamp();
  const { date: pastDate } = useParams();
  const isPast = pastDate !== undefined && pastDate !== stamp.date;
  const date = pastDate ?? stamp.date;
  const stall = useStall();
  const menus = useMenus();
  const today = useTodayState(date);
  const history = useHistory();
  const sales = useSales(date);
  const unusualId = useId();
  const [leftovers, setLeftovers] = useState<Record<string, number>>({});
  const [missed, setMissed] = useState<Record<string, HHMM>>({});
  const [unusual, setUnusual] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [cancelled, setCancelled] = useState<Record<string, boolean>>({});
  const [unknown, setUnknown] = useState<Record<string, boolean>>({});
  const [timeEdits, setTimeEdits] = useState<Record<string, HHMM>>({});

  if (
    !stall ||
    menus === undefined ||
    today === undefined ||
    history === undefined ||
    sales === undefined
  ) {
    return (
      <Screen title={t("close.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  if (pastDate !== undefined && !isPast) {
    return <Navigate to="/close" replace />;
  }
  const isClosed = today.day?.closed === true;
  if (
    isPast &&
    !(isClosed && canCorrect(date, stamp.date)) &&
    !incompleteDays(history.days, history.menuDays, stamp.date).includes(date)
  ) {
    return <Navigate to="/today" replace />;
  }

  const settings = stall.settings;
  const longDate = formatLongDate(date, language);
  const names = new Map(menus.map((menu) => [menu.id, menu.name]));
  const nameOf = (menuId: string) => names.get(menuId) ?? menuId;
  const rows = today.menuDays
    .filter(isCooked)
    .sort((a, b) => nameOf(a.menuId).localeCompare(nameOf(b.menuId)));

  if (rows.length === 0) {
    return (
      <Screen title={t("close.title")}>
        <EmptyState
          title={t("close.notPlannedTitle")}
          body={t("close.notPlannedBody")}
          action={<Button to="/plan">{t("service.planAction")}</Button>}
        />
      </Screen>
    );
  }

  const mode = modeOf(settings);
  if (isClosed && !correcting) {
    const correctable = canCorrect(date, stamp.date);
    return (
      <Screen title={t("close.title")}>
        <section className="card closed-card" aria-labelledby="close-done">
          <div className="closed-card__head">
            <span className="closed-card__mark">
              <CheckIcon />
            </span>
            <h2 id="close-done">{t("close.closedTitle")}</h2>
          </div>
          {today.day?.unusual === true ? (
            <p className="note note--info">{t("close.unusualNote")}</p>
          ) : null}
          <CloseSummary
            rows={rows}
            menus={menus}
            tomorrow={tomorrowPlan(date, menus, history.menuDays, history.days)}
            revenue={dayRevenue(mode, rows, menus, sales)}
          />
          <p>{t("close.tomorrowNote")}</p>
          {correctable ? (
            <>
              <p className="field__hint">
                {t("close.correctNote", {
                  date: formatLongDate(
                    addDays(date, CORRECTION_DAYS),
                    language,
                  ),
                })}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setUnusual(today.day?.unusual === true);
                  setCorrecting(true);
                }}
              >
                {t("close.correct")}
              </Button>
            </>
          ) : null}
        </section>
      </Screen>
    );
  }

  const soldOutOf = (row: MenuDay): HHMM | null =>
    timeEdits[row.menuId] ??
    (cancelled[row.menuId] === true ? null : row.soldOutAt);
  const prefillOf = (row: MenuDay): number | null => {
    if (isClosed) {
      return row.leftover;
    }
    return mode === "pos" ? remainingQty(row, sales) : null;
  };
  const leftoverOf = (row: MenuDay) => leftovers[row.menuId] ?? prefillOf(row);
  const missedOf = (row: MenuDay) => missed[row.menuId] ?? settings.closeAt;
  const entries: CloseEntry[] = rows.map((row) => {
    const soldOutAt = soldOutOf(row);
    if (soldOutAt !== null) {
      return {
        menuId: row.menuId,
        leftover: 0,
        soldOutAt,
        soldOutSource:
          timeEdits[row.menuId] === undefined ? row.soldOutSource : "manual",
      };
    }
    const leftover = leftoverOf(row);
    if (leftover !== 0) {
      return { menuId: row.menuId, leftover, soldOutAt: null };
    }
    return unknown[row.menuId] === true
      ? {
          menuId: row.menuId,
          leftover,
          soldOutAt: settings.closeAt,
          soldOutSource: "unknown_time",
        }
      : {
          menuId: row.menuId,
          leftover,
          soldOutAt: missedOf(row),
          soldOutSource: "manual",
        };
  });
  const missing = new Set(
    rows
      .filter((row) => soldOutOf(row) === null && leftoverOf(row) === null)
      .map((row) => row.menuId),
  );
  const errors = new Map(
    rows.flatMap((row) => {
      if (
        soldOutOf(row) !== null ||
        leftoverOf(row) !== 0 ||
        unknown[row.menuId] === true
      ) {
        return [];
      }
      const error = validateSoldOutTime(missedOf(row), settings);
      return error === null ? [] : [[row.menuId, error] as const];
    }),
  );
  const notesOf = (row: MenuDay): string[] => {
    const notes: string[] = [];
    const entered = leftoverOf(row);
    if (mode === "pos" && soldOutOf(row) === null && entered !== null) {
      const remaining = remainingQty(row, sales);
      if (entered !== remaining) {
        notes.push(
          t("close.posNote", {
            remaining,
            entered,
            gap: formatDelta(leftoverGap(entered, remaining)),
          }),
        );
      }
    }
    const over = overPlanQty(row, sales);
    if (over > 0) {
      notes.push(t("close.posOver", { qty: over }));
    }
    return notes;
  };
  const editRow = rows.find((row) => row.menuId === editing);
  const todayRows = today.menuDays;
  const historyMenuDays = history.menuDays;
  const historyDays = history.days;
  const menuList = menus;

  function cancelSoldOut(menuId: string) {
    const row = rows.find((item) => item.menuId === menuId);
    setCancelled((current) => ({ ...current, [menuId]: true }));
    setTimeEdits((current) => {
      const next = { ...current };
      delete next[menuId];
      return next;
    });
    setLeftovers((current) => ({
      ...current,
      [menuId]: Math.max(1, row === undefined ? 0 : (prefillOf(row) ?? 0)),
    }));
  }

  function restoreSoldOut(menuId: string) {
    setCancelled((current) => ({ ...current, [menuId]: false }));
    setLeftovers((current) => {
      const next = { ...current };
      delete next[menuId];
      return next;
    });
  }

  function preview() {
    const closed = closeDayRecords(date, unusual, todayRows, entries, settings);
    const merged = withClosedDay(historyMenuDays, historyDays, closed);
    return {
      rows: closed.menuDays,
      revenue: dayRevenue(mode, closed.menuDays, menuList, sales ?? []),
      tomorrow: tomorrowPlan(date, menuList, merged.menuDays, merged.days),
    };
  }

  async function confirm() {
    setBusy(true);
    try {
      await closeDay(
        db,
        date,
        { unusual, entries },
        isClosed ? stamp.date : undefined,
      );
      setConfirming(false);
      setCorrecting(false);
      toast.show(
        isClosed
          ? t("close.corrected")
          : isPast
            ? t("close.pastClosed", { date: longDate })
            : t("close.closed"),
      );
    } catch {
      toast.show(t("common.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function writeTime(
    menuId: string,
    time: HHMM | null,
    message: MessageKey,
  ) {
    try {
      if (!isClosed) {
        await setSoldOut(db, date, menuId, time);
      } else if (time === null) {
        cancelSoldOut(menuId);
      } else {
        setTimeEdits((current) => ({ ...current, [menuId]: time }));
      }
      setEditing(null);
      toast.show(t(message));
    } catch {
      toast.show(t("common.saveFailed"));
    }
  }

  const sheet = confirming ? preview() : null;

  return (
    <Screen title={t("close.title")}>
      {isPast ? (
        <p className="note note--info">
          {t("close.pastIntro", { date: longDate })}
        </p>
      ) : null}
      <p className="note">{t("close.intro")}</p>
      <ul className="card-grid">
        {rows.map((row) => {
          const error = submitted ? errors.get(row.menuId) : undefined;
          return (
            <CloseRow
              key={row.menuId}
              name={nameOf(row.menuId)}
              cooked={row.cookedQty}
              soldOutAt={soldOutOf(row)}
              leftover={leftoverOf(row)}
              leftoverError={
                submitted && missing.has(row.menuId)
                  ? t("close.leftoverMissing")
                  : undefined
              }
              missedTime={missedOf(row)}
              missedError={
                error === undefined
                  ? undefined
                  : t(`soldOut.error.${error}`, {
                      open: settings.openAt,
                      close: settings.closeAt,
                    })
              }
              onLeftover={(value) => {
                setLeftovers((current) => ({
                  ...current,
                  [row.menuId]: value,
                }));
              }}
              unknownTime={unknown[row.menuId] === true}
              cancelled={cancelled[row.menuId] === true}
              notes={notesOf(row)}
              onMissedTime={(value) => {
                setMissed((current) => ({ ...current, [row.menuId]: value }));
              }}
              onUnknownTime={(value) => {
                setUnknown((current) => ({ ...current, [row.menuId]: value }));
              }}
              onCancelSoldOut={() => {
                cancelSoldOut(row.menuId);
              }}
              onRestoreSoldOut={() => {
                restoreSoldOut(row.menuId);
              }}
              onEditTime={() => {
                setEditing(row.menuId);
              }}
            />
          );
        })}
      </ul>
      <div className="card check">
        <input
          id={unusualId}
          type="checkbox"
          checked={unusual}
          aria-describedby={`${unusualId}-hint`}
          onChange={(event) => {
            setUnusual(event.target.checked);
          }}
        />
        <label htmlFor={unusualId}>{t("close.unusual")}</label>
        <p id={`${unusualId}-hint`} className="field__hint check__hint">
          {t("close.unusualHint")}
        </p>
      </div>
      <div className="action-bar">
        <Button
          wide
          onClick={() => {
            setSubmitted(true);
            if (errors.size === 0 && missing.size === 0) {
              setConfirming(true);
            }
          }}
        >
          {t("close.closeDay")}
        </Button>
      </div>
      {submitted && missing.size > 0 ? (
        <p className="field__error" role="alert">
          {t("close.leftoverMissingSummary", { count: missing.size })}
        </p>
      ) : null}
      {sheet === null ? null : (
        <Sheet
          open
          title={
            isPast
              ? t("close.pastSheetTitle", { date: longDate })
              : t("close.sheetTitle")
          }
          onClose={() => {
            setConfirming(false);
          }}
        >
          {unusual ? (
            <p className="note note--info">{t("close.unusualNote")}</p>
          ) : null}
          <CloseSummary
            rows={sheet.rows}
            menus={menus}
            tomorrow={isPast ? null : sheet.tomorrow}
            revenue={sheet.revenue}
          />
          <div className="form__actions">
            <Button
              variant="secondary"
              onClick={() => {
                setConfirming(false);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                void confirm();
              }}
            >
              {t("close.confirm")}
            </Button>
          </div>
        </Sheet>
      )}
      {editRow === undefined || soldOutOf(editRow) === null ? null : (
        <SoldOutTimeSheet
          menuName={nameOf(editRow.menuId)}
          initial={soldOutOf(editRow) ?? settings.closeAt}
          settings={settings}
          onSave={(time) => {
            void writeTime(editRow.menuId, time, "service.timeSaved");
          }}
          onClear={() => {
            void writeTime(editRow.menuId, null, "service.cleared");
          }}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </Screen>
  );
}
