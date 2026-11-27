// src/app/EntryGate.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { hasEntered } from "./entry.ts";

interface EntryGateProps {
  children: ReactNode;
}

export function EntryGate({ children }: EntryGateProps) {
  if (!hasEntered()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
