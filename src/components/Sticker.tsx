// src/components/Sticker.tsx
import type { ReactNode } from "react";

interface StickerProps {
  children: ReactNode;
}

export function Sticker({ children }: StickerProps) {
  return <span className="sticker">{children}</span>;
}
