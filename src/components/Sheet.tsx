// src/components/Sheet.tsx
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useT } from "../i18n/index.ts";
import { CloseXIcon } from "./icons/CloseXIcon.tsx";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function focusables(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
  const t = useT();
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const node = panel.current;
    const firstField = node?.querySelector<HTMLElement>(
      "input, select, textarea",
    );
    (firstField ?? node)?.focus();
    return () => {
      previous?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || panel.current === null) {
      return;
    }
    const items = focusables(panel.current);
    const first = items[0];
    const last = items[items.length - 1];
    if (first === undefined || last === undefined) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="sheet-backdrop">
      <div
        ref={panel}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="sheet__head">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label={t("common.closeDialog")}
            onClick={onClose}
          >
            <CloseXIcon />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
