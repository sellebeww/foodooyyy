// src/components/StatTile.tsx
import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  children: ReactNode;
}

export function StatTile({ label, children }: StatTileProps) {
  return (
    <div className="stat">
      <dt className="stat__label">{label}</dt>
      <dd className="stat__value">{children}</dd>
    </div>
  );
}
