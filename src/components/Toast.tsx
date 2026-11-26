// src/components/Toast.tsx
import type { CSSProperties } from "react";
import type { ToastMessage } from "../app/toast.ts";
import { CheckIcon } from "./icons/CheckIcon.tsx";

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast === null ? null : (
        <div
          className={
            toast.durationMs === undefined ? "toast" : "toast toast--timed"
          }
          key={toast.id}
          style={{ "--toast-ms": `${toast.durationMs}ms` } as CSSProperties}
        >
          <CheckIcon />
          <span className="toast__message">{toast.message}</span>
          {toast.actionLabel !== undefined && toast.onAction !== undefined ? (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
            >
              {toast.actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
