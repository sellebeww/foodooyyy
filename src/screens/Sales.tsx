// src/screens/Sales.tsx
import { Screen } from "../components/Screen.tsx";
import { useStall } from "../db/hooks.ts";
import { modeOf } from "../domain/pos.ts";
import { useT } from "../i18n/index.ts";
import { Register } from "./Register.tsx";
import { Service } from "./Service.tsx";

export function Sales() {
  const t = useT();
  const stall = useStall();
  if (stall === undefined) {
    return (
      <Screen title={t("nav.service")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }
  return stall !== null && modeOf(stall.settings) === "pos" ? (
    <Register />
  ) : (
    <Service />
  );
}
