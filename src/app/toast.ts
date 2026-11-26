// src/app/toast.ts
import { createContext, useContext } from "react";

export const TOAST_MS = 4_000;
export const UNDO_MS = 10_000;

export interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
  background?: boolean;
}

export interface ToastMessage extends ToastOptions {
  id: number;
  message: string;
}

export interface ToastValue {
  show: (message: string, options?: ToastOptions) => void;
}

export const ToastContext = createContext<ToastValue>({
  show: () => undefined,
});

export function useToast(): ToastValue {
  return useContext(ToastContext);
}
