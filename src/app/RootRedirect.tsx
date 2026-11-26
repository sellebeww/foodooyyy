// src/app/RootRedirect.tsx
import { Navigate } from "react-router-dom";
import { useStall } from "../db/hooks.ts";
import { Splash } from "../components/Splash.tsx";

export function RootRedirect() {
  const stall = useStall();
  if (stall === undefined) {
    return <Splash />;
  }
  return <Navigate to={stall === null ? "/welcome" : "/today"} replace />;
}
