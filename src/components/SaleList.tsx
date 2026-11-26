// src/components/SaleList.tsx
import type { SaleGroup } from "../domain/pos.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";

interface SaleListProps {
  groups: readonly SaleGroup[];
  nameOf: (menuId: string) => string;
  disabled: boolean;
  onVoid: () => void;
}

export function SaleList({ groups, nameOf, disabled, onVoid }: SaleListProps) {
  const t = useT();
  if (groups.length === 0) {
    return <p>{t("register.noSales")}</p>;
  }
  return (
    <>
      <ul className="sale-list">
        {groups.map((group) => (
          <li key={group.groupId} className="sale-list__item">
            <span className="num">{group.time}</span>{" "}
            <span>
              {group.lines
                .map((line) =>
                  t("register.line", {
                    qty: line.qty,
                    name: nameOf(line.menuId),
                  }),
                )
                .join(", ")}
            </span>{" "}
            <span className="chip">
              {t(
                group.method === "cash"
                  ? "register.methodCash"
                  : "register.methodQris",
              )}
            </span>{" "}
            <strong className="num">{formatRupiah(group.total)}</strong>
          </li>
        ))}
      </ul>
      {disabled ? null : (
        <Button variant="danger" className="btn--small" onClick={onVoid}>
          {t("register.void")}
        </Button>
      )}
    </>
  );
}
