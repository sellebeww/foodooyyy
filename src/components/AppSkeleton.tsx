// src/components/AppSkeleton.tsx
import { useT } from "../i18n/index.ts";

export function AppSkeleton() {
  const t = useT();
  return (
    <div className="skeleton-screen" aria-busy="true">
      <p role="status" className="visually-hidden">
        {t("app.loading")}
      </p>
      <span className="skeleton skeleton--title" aria-hidden="true" />
      <span className="skeleton skeleton--line" aria-hidden="true" />
      <span className="skeleton skeleton--card" aria-hidden="true" />
      <span className="skeleton skeleton--card" aria-hidden="true" />
    </div>
  );
}
