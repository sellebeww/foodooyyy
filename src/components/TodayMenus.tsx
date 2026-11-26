// src/components/TodayMenus.tsx
import { useToast } from "../app/toast.ts";
import { isCooked } from "../domain/plan.ts";
import type { MenuDay } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { ShareIcon } from "./icons/ShareIcon.tsx";

interface TodayMenusProps {
  heading: string;
  rows: readonly MenuDay[];
  nameOf: (menuId: string) => string;
}

export function TodayMenus({ heading, rows, nameOf }: TodayMenusProps) {
  const t = useT();
  const toast = useToast();
  const cooked = rows
    .filter(isCooked)
    .sort((a, b) => nameOf(a.menuId).localeCompare(nameOf(b.menuId)));
  if (cooked.length === 0) {
    return null;
  }

  async function share() {
    const total = cooked.reduce((sum, row) => sum + row.cookedQty, 0);
    const text = [
      heading,
      ...cooked.map((row) => `${nameOf(row.menuId)}: ${row.cookedQty}`),
      t("plan.total", { qty: total }),
    ].join("\n");
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.show(t("today.share.copied"));
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        toast.show(t("today.share.failed"));
      }
    }
  }

  return (
    <section className="card panel today-menus" aria-labelledby="today-menus">
      <div className="panel__head">
        <h2 id="today-menus">{t("today.menus.title")}</h2>
        <Button
          variant="secondary"
          className="btn--small"
          icon={<ShareIcon />}
          onClick={() => {
            void share();
          }}
        >
          {t("today.share.action")}
        </Button>
      </div>
      <ul className="menu-status">
        {cooked.map((row) => (
          <li key={row.menuId} className="menu-status__row">
            <span className="menu-status__main">
              <span className="menu-status__name">{nameOf(row.menuId)}</span>{" "}
              <span className="menu-status__qty">
                {t("close.cookedOf", { qty: row.cookedQty })}
              </span>
            </span>
            {row.soldOutAt !== null ? (
              <span className="badge badge--soldout">
                {t("day.soldOutAt", { time: row.soldOutAt })}
              </span>
            ) : row.leftover === null ? (
              <span className="badge badge--closed">
                {t("today.menus.available")}
              </span>
            ) : (
              <span className="badge badge--plain">
                {t("today.menus.left", { qty: row.leftover })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
