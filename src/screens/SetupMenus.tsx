// src/screens/SetupMenus.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.tsx";
import { MenuManager } from "../components/MenuManager.tsx";
import { Screen } from "../components/Screen.tsx";
import { SetupProgress } from "../components/SetupProgress.tsx";
import { useMenus } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";

export function SetupMenus() {
  const t = useT();
  const navigate = useNavigate();
  const menus = useMenus();
  const [blocked, setBlocked] = useState(false);
  const activeCount = (menus ?? []).filter((menu) => !menu.archived).length;

  return (
    <Screen title={t("setup.menus.title")} showSettings={false} narrow>
      <SetupProgress step={1} />
      <p>{t("setup.menus.intro")}</p>
      <MenuManager showSalvage={false} />
      {blocked && activeCount === 0 ? (
        <p className="form__failure" role="alert">
          {t("setup.menus.needOne")}
        </p>
      ) : null}
      <div className="form__actions form__actions--page">
        <Button variant="secondary" to="/welcome">
          {t("common.back")}
        </Button>
        <Button
          onClick={() => {
            if (activeCount === 0) {
              setBlocked(true);
              return;
            }
            navigate("/setup/hours");
          }}
        >
          {t("common.next")}
        </Button>
      </div>
    </Screen>
  );
}
