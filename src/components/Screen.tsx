// src/components/Screen.tsx
import type { ReactNode } from "react";
import { useScreenArrival } from "../app/useScreenArrival.ts";
import { Header } from "./Header.tsx";

interface ScreenProps {
  title: string;
  showSettings?: boolean;
  narrow?: boolean;
  children: ReactNode;
}

export function Screen({
  title,
  showSettings = true,
  narrow = false,
  children,
}: ScreenProps) {
  useScreenArrival(title);

  return (
    <div className={narrow ? "screen screen--narrow" : "screen"}>
      <Header title={title} showSettings={showSettings} />
      <main id="main" className="screen__main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
