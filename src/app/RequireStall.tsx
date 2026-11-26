// src/app/RequireStall.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";

interface RequireStallProps {
  children: ReactNode;
}

export function RequireStall({ children }: RequireStallProps) {
  const t = useT();
  const stall = useStall();
  if (stall === undefined) {
    return <p role="status">{t("app.loading")}</p>;
  }
  if (stall === null) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}
