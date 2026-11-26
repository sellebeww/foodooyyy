// src/components/RegisterTile.tsx
import type { HHMM } from "../domain/types.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";

interface RegisterTileProps {
  name: string;
  price: number;
  cooked: number;
  remaining: number;
  over: number;
  inCart: number;
  soldOutAt: HHMM | null;
  disabled: boolean;
  onAdd: () => void;
  onSoldOut: () => void;
}

export function RegisterTile({
  name,
  price,
  cooked,
  remaining,
  over,
  inCart,
  soldOutAt,
  disabled,
  onAdd,
  onSoldOut,
}: RegisterTileProps) {
  const t = useT();
  const percent = cooked === 0 ? 0 : Math.round((100 * remaining) / cooked);
  return (
    <li className="service-tile-wrap">
      <button
        type="button"
        className={
          soldOutAt === null
            ? "service-tile"
            : "service-tile service-tile--soldout"
        }
        disabled={disabled}
        onClick={onAdd}
      >
        <span className="service-tile__name">{name}</span>{" "}
        <span className="service-tile__hint num">{formatRupiah(price)}</span>{" "}
        <span className="service-tile__cooked">
          {soldOutAt === null
            ? t("register.left", { qty: remaining })
            : t("service.soldOutAt", { time: soldOutAt })}
        </span>
        {over > 0 ? (
          <span className="stamp">{t("register.over", { qty: over })}</span>
        ) : null}
        <span
          className="stockbar"
          role="img"
          aria-label={t("register.stockLabel", {
            name,
            left: remaining,
            total: cooked,
          })}
        >
          <span
            className="stockbar__fill"
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </span>
        {inCart > 0 ? (
          <span key={inCart} className="chip num">{`× ${inCart}`}</span>
        ) : null}
      </button>
      {soldOutAt === null && !disabled ? (
        <button
          type="button"
          className="btn btn--secondary btn--small service-tile__edit"
          aria-label={t("register.soldOutLabel", { name })}
          onClick={onSoldOut}
        >
          <span>{t("register.soldOutButton")}</span>
        </button>
      ) : null}
    </li>
  );
}
