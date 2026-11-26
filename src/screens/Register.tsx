// src/screens/Register.tsx
import { useEffect, useRef, useState } from "react";
import { useClock } from "../app/clock.ts";
import { useActionTime } from "../app/useActionTime.ts";
import { toLocalStamp } from "../app/localStamp.ts";
import { UNDO_MS, useToast } from "../app/toast.ts";
import { useStallStamp } from "../app/useStallStamp.ts";
import { Button } from "../components/Button.tsx";
import { CartSheet } from "../components/CartSheet.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { RegisterTile } from "../components/RegisterTile.tsx";
import { SaleList } from "../components/SaleList.tsx";
import { Screen } from "../components/Screen.tsx";
import { Sheet } from "../components/Sheet.tsx";
import {
  useDb,
  useMenus,
  useSales,
  useStall,
  useTodayState,
} from "../db/hooks.ts";
import { recordSale, setSoldOut, voidLastSale } from "../db/repositories.ts";
import { isCooked } from "../domain/plan.ts";
import {
  groupSales,
  overPlanQty,
  remainingQty,
  salesRevenue,
  cartTotal,
  type CartLine,
} from "../domain/pos.ts";
import { stallDate } from "../domain/time.ts";
import type { HHMM, PayMethod } from "../domain/types.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";

export function Register() {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const clock = useClock();
  const actionTime = useActionTime();
  const { date } = useStallStamp();
  const stall = useStall();
  const menus = useMenus();
  const today = useTodayState(date);
  const sales = useSales(date);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [busy, setBusy] = useState(false);
  const cartDate = useRef(date);

  useEffect(() => {
    if (cartDate.current === date) {
      return;
    }
    cartDate.current = date;
    setCart((current) => {
      if (Object.keys(current).length > 0) {
        toast.show(t("register.dayChanged"));
      }
      return {};
    });
    setCartOpen(false);
    setVoiding(false);
  }, [date, toast, t]);

  if (
    !stall ||
    menus === undefined ||
    today === undefined ||
    sales === undefined
  ) {
    return (
      <Screen title={t("register.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  const nameOf = (menuId: string) => byId.get(menuId)?.name ?? menuId;
  const rows = today.menuDays
    .filter(isCooked)
    .sort((a, b) => nameOf(a.menuId).localeCompare(nameOf(b.menuId)));

  if (rows.length === 0) {
    return (
      <Screen title={t("register.title")}>
        <EmptyState
          title={t("service.notPlannedTitle")}
          body={t("service.notPlannedBody")}
          action={<Button to="/plan">{t("service.planAction")}</Button>}
        />
      </Screen>
    );
  }

  const closed = today.day?.closed === true;
  const lines: CartLine[] = rows
    .filter((row) => (cart[row.menuId] ?? 0) > 0)
    .map((row) => ({ menuId: row.menuId, qty: cart[row.menuId] ?? 0 }));
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const groups = groupSales(sales);
  const last = groups[0];

  function setQty(menuId: string, qty: number) {
    setCart((current) => {
      const next = { ...current };
      if (qty <= 0) {
        delete next[menuId];
      } else {
        next[menuId] = qty;
      }
      return next;
    });
  }

  async function pay(method: PayMethod) {
    if (stall === null || stall === undefined) {
      return;
    }
    const stamp = toLocalStamp(clock.now());
    const saleDate = stallDate(stamp.date, stamp.time, stall.settings);
    const total = cartTotal(lines, menus ?? []);
    const time = actionTime();
    setBusy(true);
    try {
      const result = await recordSale(
        db,
        saleDate,
        time,
        clock.now().getTime(),
        lines,
        method,
      );
      setCart({});
      setCartOpen(false);
      toast.show(
        result.soldOutMenuIds.length === 0
          ? t("register.saved", { total: formatRupiah(total) })
          : t("register.autoSoldOut", {
              name: result.soldOutMenuIds.map(nameOf).join(", "),
              time,
            }),
      );
    } catch {
      toast.show(t("register.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function markSoldOut(menuId: string, time: HHMM | null) {
    try {
      await setSoldOut(db, date, menuId, time, "manual");
      toast.show(
        time === null
          ? t("service.undone")
          : t("service.soldOutToast", { name: nameOf(menuId), time }),
        time === null
          ? undefined
          : {
              actionLabel: t("service.undo"),
              durationMs: UNDO_MS,
              onAction: () => {
                void markSoldOut(menuId, null);
              },
            },
      );
    } catch {
      toast.show(t("common.saveFailed"));
    }
  }

  async function confirmVoid() {
    setBusy(true);
    try {
      const reopened = await voidLastSale(db, date);
      setVoiding(false);
      const first = reopened[0];
      toast.show(
        first === undefined
          ? t("register.voided")
          : t("register.voidedReopened", { name: nameOf(first) }),
      );
    } catch {
      toast.show(t("common.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title={t("register.title")}>
      <p className={closed ? "note note--info" : "note"}>
        {closed ? t("service.closedNote") : t("register.intro")}
      </p>
      <div className="register">
        <div className="register__tiles">
          <ul className="service-grid">
            {rows.map((row) => (
              <RegisterTile
                key={row.menuId}
                name={nameOf(row.menuId)}
                price={byId.get(row.menuId)?.price ?? 0}
                cooked={row.cookedQty}
                remaining={remainingQty(row, sales)}
                over={overPlanQty(row, sales)}
                inCart={cart[row.menuId] ?? 0}
                soldOutAt={row.soldOutAt}
                disabled={closed}
                onAdd={() => {
                  setQty(row.menuId, (cart[row.menuId] ?? 0) + 1);
                }}
                onSoldOut={() => {
                  void markSoldOut(row.menuId, actionTime());
                }}
              />
            ))}
          </ul>
          {itemCount === 0 || closed ? null : (
            <div className="action-bar">
              <Button
                wide
                onClick={() => {
                  setCartOpen(true);
                }}
              >
                {t("register.cartButton", {
                  count: itemCount,
                  total: formatRupiah(cartTotal(lines, menus)),
                })}
              </Button>
            </div>
          )}
        </div>
        <section
          className="card panel register__side"
          aria-labelledby="register-today"
        >
          <h2 id="register-today">{t("register.todayTitle")}</h2>
          <dl className="counts__grid">
            <div className="counts__item">
              <dt>{t("register.revenue")}</dt>
              <dd className="num">{formatRupiah(salesRevenue(sales))}</dd>
            </div>
            <div className="counts__item">
              <dt>{t("register.count")}</dt>
              <dd className="num">{groups.length}</dd>
            </div>
          </dl>
          <SaleList
            groups={groups}
            nameOf={nameOf}
            disabled={closed}
            onVoid={() => {
              setVoiding(true);
            }}
          />
        </section>
      </div>
      {cartOpen && !closed ? (
        <CartSheet
          lines={lines}
          menus={menus}
          busy={busy}
          onQty={setQty}
          onClear={() => {
            setCart({});
            setCartOpen(false);
          }}
          onPay={(method) => {
            void pay(method);
          }}
          onClose={() => {
            setCartOpen(false);
          }}
        />
      ) : null}
      {voiding && last !== undefined ? (
        <Sheet
          open
          title={t("register.voidTitle")}
          onClose={() => {
            setVoiding(false);
          }}
        >
          <p>
            {t("register.voidBody", {
              time: last.time,
              total: formatRupiah(last.total),
            })}
          </p>
          <div className="form__actions">
            <Button
              variant="secondary"
              onClick={() => {
                setVoiding(false);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => {
                void confirmVoid();
              }}
            >
              {t("register.voidConfirm")}
            </Button>
          </div>
        </Sheet>
      ) : null}
    </Screen>
  );
}
