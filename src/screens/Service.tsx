// src/screens/Service.tsx
import { useState } from "react";
import { useActionTime } from "../app/useActionTime.ts";
import { useStallStamp } from "../app/useStallStamp.ts";
import { UNDO_MS, useToast } from "../app/toast.ts";
import { Button } from "../components/Button.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { Screen } from "../components/Screen.tsx";
import { ServiceTile } from "../components/ServiceTile.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { SoldOutTimeSheet } from "../components/SoldOutTimeSheet.tsx";
import { isEarlySellOut } from "../domain/close.ts";
import { useDb, useMenus, useStall, useTodayState } from "../db/hooks.ts";
import { setSoldOut } from "../db/repositories.ts";
import { isCooked } from "../domain/plan.ts";
import type { HHMM } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";

export function Service() {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const actionTime = useActionTime();
  const { date } = useStallStamp();
  const stall = useStall();
  const menus = useMenus();
  const today = useTodayState(date);
  const [editing, setEditing] = useState<string | null>(null);
  const [early, setEarly] = useState<{ menuId: string; time: HHMM } | null>(
    null,
  );

  if (!stall || menus === undefined || today === undefined) {
    return (
      <Screen title={t("service.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  const names = new Map(menus.map((menu) => [menu.id, menu.name]));
  const nameOf = (menuId: string) => names.get(menuId) ?? menuId;
  const rows = today.menuDays
    .filter(isCooked)
    .sort((a, b) => nameOf(a.menuId).localeCompare(nameOf(b.menuId)));

  if (rows.length === 0) {
    return (
      <Screen title={t("service.title")}>
        <EmptyState
          title={t("service.notPlannedTitle")}
          body={t("service.notPlannedBody")}
          action={<Button to="/plan">{t("service.planAction")}</Button>}
        />
      </Screen>
    );
  }

  const closed = today.day?.closed === true;
  const editRow = rows.find((row) => row.menuId === editing);
  const soldOutCount = rows.filter((row) => row.soldOutAt !== null).length;

  async function write(
    menuId: string,
    time: HHMM | null,
    done: () => void,
  ): Promise<void> {
    try {
      await setSoldOut(db, date, menuId, time);
      done();
    } catch {
      toast.show(t("common.saveFailed"));
    }
  }

  function tapSoldOut(menuId: string) {
    const time = actionTime();
    if (stall && isEarlySellOut(time, stall.settings)) {
      setEarly({ menuId, time });
      return;
    }
    markSoldOut(menuId, time);
  }

  function markSoldOut(menuId: string, time: HHMM) {
    const name = nameOf(menuId);
    void write(menuId, time, () => {
      toast.show(t("service.soldOutToast", { name, time }), {
        actionLabel: t("service.undo"),
        durationMs: UNDO_MS,
        onAction: () => {
          void write(menuId, null, () => {
            toast.show(t("service.undone"));
          });
        },
      });
    });
  }

  return (
    <Screen title={t("service.title")}>
      <p className={closed ? "note note--info" : "note"}>
        {closed ? t("service.closedNote") : t("service.intro")}
      </p>
      <div className="card progress progress--card">
        <p className="progress__label">
          {t("service.progress", {
            soldOut: soldOutCount,
            total: rows.length,
          })}
        </p>
        <progress
          className="progress__bar"
          max={rows.length}
          value={soldOutCount}
          aria-hidden="true"
        />
      </div>
      <ul className="service-grid">
        {rows.map((row) => (
          <ServiceTile
            key={row.menuId}
            name={nameOf(row.menuId)}
            cooked={row.cookedQty}
            soldOutAt={row.soldOutAt}
            disabled={closed}
            onSoldOut={() => {
              tapSoldOut(row.menuId);
            }}
            onEditTime={() => {
              setEditing(row.menuId);
            }}
          />
        ))}
      </ul>
      {closed ? null : <p className="field__hint">{t("service.holdHint")}</p>}
      {early === null || closed ? null : (
        <Sheet
          open
          title={t("service.earlyTitle", { name: nameOf(early.menuId) })}
          onClose={() => {
            setEarly(null);
          }}
        >
          <p>
            {t("service.earlyBody", {
              time: early.time,
              open: stall.settings.openAt,
            })}
          </p>
          <div className="form__actions">
            <Button
              variant="secondary"
              onClick={() => {
                setEarly(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                const { menuId, time } = early;
                setEarly(null);
                markSoldOut(menuId, time);
              }}
            >
              {t("service.earlyConfirm")}
            </Button>
          </div>
        </Sheet>
      )}
      {editRow === undefined || editRow.soldOutAt === null || closed ? null : (
        <SoldOutTimeSheet
          menuName={nameOf(editRow.menuId)}
          initial={editRow.soldOutAt}
          settings={stall.settings}
          onSave={(time) => {
            void write(editRow.menuId, time, () => {
              setEditing(null);
              toast.show(t("service.timeSaved"));
            });
          }}
          onClear={() => {
            void write(editRow.menuId, null, () => {
              setEditing(null);
              toast.show(t("service.cleared"));
            });
          }}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </Screen>
  );
}
