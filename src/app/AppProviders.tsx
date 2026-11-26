// src/app/AppProviders.tsx
import type { ReactNode } from "react";
import { DbProvider } from "../db/DbProvider.tsx";
import type { FoodooDb } from "../db/schema.ts";
import { I18nProvider } from "../i18n/I18nProvider.tsx";
import { ClockProvider } from "./ClockProvider.tsx";
import { ToastProvider } from "./ToastProvider.tsx";

interface AppProvidersProps {
  db: FoodooDb;
  now?: () => Date;
  storage?: Storage | undefined;
  children: ReactNode;
}

export function AppProviders({
  db,
  now,
  storage,
  children,
}: AppProvidersProps) {
  return (
    <DbProvider db={db}>
      <I18nProvider storage={storage}>
        <ClockProvider now={now}>
          <ToastProvider>{children}</ToastProvider>
        </ClockProvider>
      </I18nProvider>
    </DbProvider>
  );
}
