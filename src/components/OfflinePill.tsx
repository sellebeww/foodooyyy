// src/components/OfflinePill.tsx
import { useOnline } from "../app/useOnline.ts";
import { useT } from "../i18n/index.ts";
import { WifiOffIcon } from "./icons/WifiOffIcon.tsx";

export function OfflinePill() {
  const t = useT();
  const online = useOnline();
  if (online) {
    return null;
  }
  return (
    <span className="pill pill--offline">
      <WifiOffIcon />
      {t("header.offline")}
    </span>
  );
}
