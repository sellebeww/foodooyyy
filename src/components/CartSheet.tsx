// src/components/CartSheet.tsx
import { useState } from "react";
import {
  CASH_CHIPS,
  cartTotal,
  changeDue,
  type CartLine,
} from "../domain/pos.ts";
import type { Menu, PayMethod } from "../domain/types.ts";
import { formatRupiah, parseWholeInput } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { Sheet } from "./Sheet.tsx";
import { Stepper } from "./Stepper.tsx";

const QTY_CAP = 999;

interface CartSheetProps {
  lines: readonly CartLine[];
  menus: readonly Menu[];
  busy: boolean;
  onQty: (menuId: string, qty: number) => void;
  onClear: () => void;
  onPay: (method: PayMethod) => void;
  onClose: () => void;
}

export function CartSheet({
  lines,
  menus,
  busy,
  onQty,
  onClear,
  onPay,
  onClose,
}: CartSheetProps) {
  const t = useT();
  const [method, setMethod] = useState<PayMethod>("cash");
  const [tendered, setTendered] = useState<number | null>(null);
  const total = cartTotal(lines, menus);
  const names = new Map(menus.map((menu) => [menu.id, menu.name]));
  const change = tendered === null ? null : changeDue(total, tendered);
  return (
    <Sheet open title={t("register.cartTitle")} onClose={onClose}>
      {lines.length === 0 ? (
        <p>{t("register.emptyCart")}</p>
      ) : (
        <ul className="cart-lines">
          {lines.map((line) => {
            const name = names.get(line.menuId) ?? line.menuId;
            return (
              <li key={line.menuId} className="cart-line">
                <span className="cart-line__name">{name}</span>
                <Stepper
                  label={name}
                  decreaseLabel={t("plan.decrease", { name })}
                  increaseLabel={t("plan.increase", { name })}
                  value={line.qty}
                  min={0}
                  max={QTY_CAP}
                  onChange={(value) => {
                    onQty(line.menuId, value);
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
      <p className="cart-total">
        <span>{t("register.total")}</span>{" "}
        <strong className="num">{formatRupiah(total)}</strong>
      </p>
      <fieldset className="method">
        <legend>{t("register.method")}</legend>
        {(["cash", "qris"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={
              method === item ? "btn btn--primary" : "btn btn--secondary"
            }
            aria-pressed={method === item}
            onClick={() => {
              setMethod(item);
            }}
          >
            {t(item === "cash" ? "register.cash" : "register.qris")}
          </button>
        ))}
      </fieldset>
      <p className="field__hint">{t("register.methodNote")}</p>
      {method === "cash" ? (
        <div className="cash">
          <label htmlFor="cash-tendered">{t("register.tendered")}</label>
          <input
            id="cash-tendered"
            className="num"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={tendered === null ? "" : String(tendered)}
            onChange={(event) => {
              const parsed = parseWholeInput(event.target.value);
              setTendered(Number.isNaN(parsed) ? null : parsed);
            }}
          />
          <div className="chips-row">
            <Button
              variant="secondary"
              className="btn--small"
              onClick={() => {
                setTendered(total);
              }}
            >
              {t("register.exact")}
            </Button>
            {CASH_CHIPS.map((value) => (
              <Button
                key={value}
                variant="secondary"
                className="btn--small"
                onClick={() => {
                  setTendered(value);
                }}
              >
                {formatRupiah(value)}
              </Button>
            ))}
          </div>
          {change === null ? null : (
            <p role="status" className="num">
              {change >= 0
                ? t("register.change", { amount: formatRupiah(change) })
                : t("register.short", { amount: formatRupiah(-change) })}
            </p>
          )}
        </div>
      ) : null}
      <div className="form__actions">
        <Button
          variant="secondary"
          disabled={lines.length === 0}
          onClick={onClear}
        >
          {t("register.clear")}
        </Button>
        <Button
          disabled={busy || lines.length === 0}
          onClick={() => {
            onPay(method);
          }}
        >
          {t("register.save")}
        </Button>
      </div>
    </Sheet>
  );
}
