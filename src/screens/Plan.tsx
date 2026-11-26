// src/screens/Plan.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStallStamp } from "../app/useStallStamp.ts";
import { useToast } from "../app/toast.ts";
import { Button } from "../components/Button.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { MenuCard } from "../components/MenuCard.tsx";
import { Screen } from "../components/Screen.tsx";
import {
  useDb,
  useHistory,
  useMenus,
  useSales,
  useStall,
  useTodayState,
} from "../db/hooks.ts";
import { savePlan } from "../db/repositories.ts";
import { planMoney } from "../domain/money.ts";
import { isPlanLocked, suggestAll } from "../domain/plan.ts";
import type { Menu, Reason } from "../domain/types.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";
import { renderReason } from "../i18n/reason.ts";

interface CardModel {
  menu: Menu;
  suggestedQty: number | null;
  reason: Reason | null;
  value: number;
}

export function Plan() {
  const { date } = useStallStamp();
  return <PlanForDate key={date} />;
}

function PlanForDate() {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const { date, weekday } = useStallStamp();
  const stall = useStall();
  const menus = useMenus();
  const today = useTodayState(date);
  const history = useHistory();
  const sales = useSales(date);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  if (
    !stall ||
    menus === undefined ||
    today === undefined ||
    history === undefined
  ) {
    return (
      <Screen title={t("plan.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  if (!stall.setupComplete) {
    return (
      <Screen title={t("plan.title")}>
        <EmptyState
          title={t("today.empty.setupTitle")}
          body={t("today.empty.setupBody")}
          action={
            <Button to="/setup/menus">{t("today.empty.setupAction")}</Button>
          }
        />
      </Screen>
    );
  }

  const closed = today.day?.closed === true;
  const locked = isPlanLocked(today.menuDays) || (sales?.length ?? 0) > 0;
  const readOnly = closed || locked;
  const stored = new Map(today.menuDays.map((row) => [row.menuId, row]));
  const suggestions = new Map(
    suggestAll(menus, weekday, history.menuDays, history.days).map((item) => [
      item.menuId,
      item,
    ]),
  );
  const shown = readOnly
    ? menus.filter((menu) => stored.has(menu.id))
    : menus.filter((menu) => !menu.archived);
  const cards: CardModel[] = shown.map((menu) => {
    const row = stored.get(menu.id);
    const suggestion = suggestions.get(menu.id);
    const suggestedQty =
      row === undefined ? (suggestion?.qty ?? null) : row.suggestedQty;
    const reason =
      row === undefined ? (suggestion?.reason ?? null) : row.reason;
    return {
      menu,
      suggestedQty,
      reason,
      value: draft[menu.id] ?? row?.cookedQty ?? suggestedQty ?? menu.usualQty,
    };
  });

  if (cards.length === 0) {
    return (
      <Screen title={t("plan.title")}>
        <EmptyState
          title={t("today.empty.menusTitle")}
          body={t("today.empty.menusBody")}
          action={
            <Button to="/settings">{t("today.empty.menusAction")}</Button>
          }
        />
      </Screen>
    );
  }

  const total = cards.reduce((sum, card) => sum + card.value, 0);
  const money = planMoney(
    cards.map((card) => ({ menu: card.menu, qty: card.value })),
  );
  const anyEdited = cards.some(
    (card) => card.suggestedQty !== null && card.value !== card.suggestedQty,
  );

  async function save() {
    setSaving(true);
    try {
      await savePlan(
        db,
        date,
        cards.map((card) => ({
          menuId: card.menu.id,
          suggestedQty: card.suggestedQty,
          reason: card.reason,
          cookedQty: card.value,
        })),
      );
      setDraft({});
      toast.show(t("plan.saved"));
      navigate("/today");
    } catch {
      toast.show(t("common.saveFailed"));
      setSaving(false);
    }
  }

  let note: string;
  if (closed) {
    note = t("plan.closedNote");
  } else if (locked) {
    note = t("plan.locked");
  } else if (stored.size > 0) {
    note = t("plan.savedNote");
  } else {
    note = t("plan.intro");
  }

  return (
    <Screen title={t("plan.title")}>
      <p className={readOnly ? "note note--info" : "note"}>{note}</p>
      <ul className="card-grid">
        {cards.map((card) => (
          <MenuCard
            key={card.menu.id}
            name={card.menu.name}
            value={card.value}
            suggested={card.suggestedQty}
            reason={
              card.reason === null
                ? null
                : renderReason(t, card.reason, {
                    weekday,
                    usualQty: card.menu.usualQty,
                  })
            }
            readOnly={readOnly}
            onChange={(value) => {
              setDraft((current) => ({ ...current, [card.menu.id]: value }));
            }}
          />
        ))}
      </ul>
      <div className="action-bar">
        <div className="action-bar__summary">
          <p className="action-bar__total">{t("plan.total", { qty: total })}</p>
          <p className="action-bar__money">
            <span>{t("plan.cost", { amount: formatRupiah(money.cost) })}</span>{" "}
            <span>
              {t("plan.revenue", { amount: formatRupiah(money.revenue) })}
            </span>
          </p>
        </div>
        {readOnly ? null : (
          <Button
            disabled={saving}
            onClick={() => {
              void save();
            }}
          >
            {t(anyEdited ? "plan.save" : "plan.acceptAll")}
          </Button>
        )}
      </div>
    </Screen>
  );
}
