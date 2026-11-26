// src/components/MenuManager.tsx
import { useState } from "react";
import { useToast } from "../app/toast.ts";
import { useDb, useMenus } from "../db/hooks.ts";
import { setMenuArchived } from "../db/repositories.ts";
import type { Menu } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { MenuEditor } from "./MenuEditor.tsx";
import { MenuList } from "./MenuList.tsx";
import { PlusIcon } from "./icons/PlusIcon.tsx";

interface MenuManagerProps {
  showSalvage: boolean;
}

type Editing = { menu: Menu | null } | null;

export function MenuManager({ showSalvage }: MenuManagerProps) {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const menus = useMenus();
  const [editing, setEditing] = useState<Editing>(null);

  if (menus === undefined) {
    return <p role="status">{t("app.loading")}</p>;
  }

  const active = menus.filter((menu) => !menu.archived);
  const archived = menus.filter((menu) => menu.archived);

  async function setArchived(menu: Menu, value: boolean) {
    try {
      await setMenuArchived(db, menu.id, value);
      toast.show(t(value ? "menu.archivedToast" : "menu.restoredToast"));
    } catch {
      toast.show(t("common.saveFailed"));
    }
  }

  return (
    <div className="menu-manager">
      {active.length === 0 ? (
        <p className="menu-manager__empty">{t("menu.list.empty")}</p>
      ) : (
        <MenuList
          menus={active}
          onEdit={(menu) => {
            setEditing({ menu });
          }}
          onArchive={(menu) => {
            void setArchived(menu, true);
          }}
        />
      )}
      <Button
        variant="secondary"
        icon={<PlusIcon />}
        onClick={() => {
          setEditing({ menu: null });
        }}
      >
        {t("menu.list.add")}
      </Button>
      {archived.length === 0 ? null : (
        <details className="menu-manager__archived">
          <summary>
            {t("menu.list.archived", { count: archived.length })}
          </summary>
          <MenuList
            menus={archived}
            onRestore={(menu) => {
              void setArchived(menu, false);
            }}
          />
        </details>
      )}
      {editing === null ? null : (
        <MenuEditor
          menu={editing.menu}
          showSalvage={showSalvage}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
