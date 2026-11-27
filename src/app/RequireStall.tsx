// src/app/RequireStall.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useStall } from "../db/hooks.ts";
import { AppSkeleton } from "../components/AppSkeleton.tsx";

interface RequireStallProps {
  children: ReactNode;
}

export function RequireStall({ children }: RequireStallProps) {
  const stall = useStall();
  if (stall === undefined) {
    return <AppSkeleton />;
  }
  if (stall === null) {
    return <Navigate to="/start" replace />;
  }
  return children;
}
