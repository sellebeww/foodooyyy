// src/components/MenuEditor.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "../app/toast.ts";
import { useDb } from "../db/hooks.ts";
import { saveMenu } from "../db/repositories.ts";
import {
  NAME_MAX_LENGTH,
  validateMenu,
  type MenuErrors,
  type MenuField,
  type MenuInput,
} from "../domain/setup.ts";
import type { Menu } from "../domain/types.ts";
import { parseWholeInput } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { Sheet } from "./Sheet.tsx";
import { TextField } from "./TextField.tsx";

interface MenuEditorProps {
  menu: Menu | null;
  showSalvage: boolean;
  onClose: () => void;
}

type Draft = Record<MenuField, string>;

function initialDraft(menu: Menu | null): Draft {
  return {
    name: menu?.name ?? "",
    price: menu === null ? "" : String(menu.price),
    cost: menu === null ? "" : String(menu.cost),
    salvage: String(menu?.salvage ?? 0),
    usualQty: menu === null ? "" : String(menu.usualQty),
  };
}

function toInput(draft: Draft): MenuInput {
  return {
    name: draft.name,
    price: parseWholeInput(draft.price),
    cost: parseWholeInput(draft.cost),
    salvage: parseWholeInput(draft.salvage),
    usualQty: parseWholeInput(draft.usualQty),
  };
}

export function MenuEditor({ menu, showSalvage, onClose }: MenuEditorProps) {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const form = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<Draft>(() => initialDraft(menu));
  const [attempts, setAttempts] = useState(0);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors: MenuErrors = attempts > 0 ? validateMenu(toInput(draft)) : {};

  useEffect(() => {
    if (attempts > 0) {
      form.current
        ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [attempts]);

  function update(field: MenuField) {
    return (value: string) => {
      setDraft((current) => ({ ...current, [field]: value }));
    };
  }

  function message(field: MenuField): string | undefined {
    const code = errors[field];
    return code === undefined ? undefined : t(`menu.error.${code}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = toInput(draft);
    setAttempts((count) => count + 1);
    if (Object.keys(validateMenu(input)).length > 0) {
      return;
    }
    setSaving(true);
    setFailed(false);
    try {
      await saveMenu(db, input, menu?.id);
      toast.show(t("menu.saved"));
      onClose();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  }

  return (
    <Sheet
      open
      title={t(
        menu === null ? "menu.editor.addTitle" : "menu.editor.editTitle",
      )}
      onClose={onClose}
    >
      <form
        ref={form}
        className="form"
        noValidate
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <TextField
          label={t("menu.field.name")}
          value={draft.name}
          onChange={update("name")}
          error={message("name")}
          maxLength={NAME_MAX_LENGTH + 10}
          autoComplete="off"
        />
        <div className="form__row">
          <TextField
            label={t("menu.field.price")}
            value={draft.price}
            onChange={update("price")}
            error={message("price")}
            inputMode="numeric"
            autoComplete="off"
          />
          <TextField
            label={t("menu.field.cost")}
            value={draft.cost}
            onChange={update("cost")}
            error={message("cost")}
            inputMode="numeric"
            autoComplete="off"
          />
        </div>
        <TextField
          label={t("menu.field.usualQty")}
          value={draft.usualQty}
          onChange={update("usualQty")}
          error={message("usualQty")}
          inputMode="numeric"
          autoComplete="off"
        />
        {showSalvage ? (
          <TextField
            label={t("menu.field.salvage")}
            hint={t("menu.field.salvageHint")}
            value={draft.salvage}
            onChange={update("salvage")}
            error={message("salvage")}
            inputMode="numeric"
            autoComplete="off"
          />
        ) : null}
        {failed ? (
          <p className="form__failure" role="alert">
            {t("common.saveFailed")}
          </p>
        ) : null}
        <div className="form__actions">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={saving}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
