// src/components/ServiceTile.tsx
import { useEffect, useRef, type PointerEvent } from "react";
import type { HHMM } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";
import { EditIcon } from "./icons/EditIcon.tsx";

export const LONG_PRESS_MS = 500;

interface ServiceTileProps {
  name: string;
  cooked: number;
  soldOutAt: HHMM | null;
  disabled: boolean;
  onSoldOut: () => void;
  onEditTime: () => void;
}

export function ServiceTile({
  name,
  cooked,
  soldOutAt,
  disabled,
  onSoldOut,
  onEditTime,
}: ServiceTileProps) {
  const t = useT();
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const soldOut = soldOutAt !== null;

  function cancel() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  useEffect(() => cancel, []);

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    longPressed.current = false;
    if (!soldOut || event.button !== 0) {
      return;
    }
    cancel();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      longPressed.current = true;
      onEditTime();
    }, LONG_PRESS_MS);
  }

  return (
    <li className="service-tile-wrap">
      <button
        type="button"
        className={
          soldOut ? "service-tile service-tile--soldout" : "service-tile"
        }
        disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          if (!soldOut) {
            onSoldOut();
          }
        }}
      >
        <span className="service-tile__name">{name}</span>{" "}
        {soldOut ? (
          <span className="stamp">
            {t("service.soldOutAt", { time: soldOutAt })}
          </span>
        ) : (
          <>
            <span className="service-tile__cooked">
              {t("service.cooked", { qty: cooked })}
            </span>{" "}
            <span className="service-tile__hint">{t("service.tapHint")}</span>
          </>
        )}
      </button>
      {soldOut && !disabled ? (
        <button
          type="button"
          className="btn btn--secondary btn--small service-tile__edit"
          aria-label={t("service.editTimeLabel", { name })}
          onClick={onEditTime}
        >
          <EditIcon />
          <span>{t("service.editTime")}</span>
        </button>
      ) : null}
    </li>
  );
}
