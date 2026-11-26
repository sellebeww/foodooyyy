// src/app/ToastProvider.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "../components/Toast.tsx";
import {
  TOAST_MS,
  ToastContext,
  type ToastMessage,
  type ToastOptions,
} from "./toast.ts";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    nextId.current += 1;
    const next = { id: nextId.current, message, ...options };
    setToast((current) =>
      options.background === true && current !== null ? current : next,
    );
  }, []);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast === null) {
      return undefined;
    }
    const timer = window.setTimeout(dismiss, toast.durationMs ?? TOAST_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast, dismiss]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
