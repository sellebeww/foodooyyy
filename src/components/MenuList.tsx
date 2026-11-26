// src/components/MenuList.tsx
import type { Menu } from "../domain/types.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";
import { ArchiveIcon } from "./icons/ArchiveIcon.tsx";
import { EditIcon } from "./icons/EditIcon.tsx";
import { RestoreIcon } from "./icons/RestoreIcon.tsx";

interface MenuListProps {
  menus: readonly Menu[];
  onEdit?: (menu: Menu) => void;
  onArchive?: (menu: Menu) => void;
  onRestore?: (menu: Menu) => void;
}

export function MenuList({
  menus,
  onEdit,
  onArchive,
  onRestore,
}: MenuListProps) {
  const t = useT();
  return (
    <ul className="menu-list">
      {menus.map((menu) => (
        <li key={menu.id} className="menu-row">
          <div className="menu-row__text">
            <p className="menu-row__name">{menu.name}</p>
            <p className="menu-row__meta">
              {t("menu.list.summary", {
                price: formatRupiah(menu.price),
                cost: formatRupiah(menu.cost),
                qty: menu.usualQty,
              })}
            </p>
          </div>
          <div className="menu-row__actions">
            {onEdit === undefined ? null : (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                aria-label={t("menu.list.editLabel", { name: menu.name })}
                onClick={() => {
                  onEdit(menu);
                }}
              >
                <EditIcon />
                <span>{t("common.edit")}</span>
              </button>
            )}
            {onArchive === undefined ? null : (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                aria-label={t("menu.list.archiveLabel", { name: menu.name })}
                onClick={() => {
                  onArchive(menu);
                }}
              >
                <ArchiveIcon />
                <span>{t("common.archive")}</span>
              </button>
            )}
            {onRestore === undefined ? null : (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                aria-label={t("menu.list.restoreLabel", { name: menu.name })}
                onClick={() => {
                  onRestore(menu);
                }}
              >
                <RestoreIcon />
                <span>{t("common.restore")}</span>
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
