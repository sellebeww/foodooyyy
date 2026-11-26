// src/components/ExportImportPanel.tsx
import { useId, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStamp } from "../app/clock.ts";
import { saveFile } from "../app/download.ts";
import { useToast } from "../app/toast.ts";
import { useDb } from "../db/hooks.ts";
import type {
  ExportFormat,
  ImportIssue,
  ImportPlan,
} from "../db/exportImport.ts";
import { STALL_ID } from "../db/schema.ts";
import { useT, type MessageKey } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { Sheet } from "./Sheet.tsx";

const FORMATS: readonly ExportFormat[] = ["json", "csv", "xlsx"];

interface ExportImportPanelProps {
  compact?: boolean;
}

export function ExportImportPanel({ compact = false }: ExportImportPanelProps) {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const { date, time } = useLocalStamp();
  const fileId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [busy, setBusy] = useState(false);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  async function onExport() {
    setBusy(true);
    try {
      const { exportData } = await import("../db/exportImport.ts");
      saveFile(await exportData(db, format, date, `${date}T${time}`));
      toast.show(t("transfer.exported"));
    } catch {
      toast.show(t("transfer.exportFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) {
      return;
    }
    setBusy(true);
    setIssues([]);
    try {
      const { parseImport } = await import("../db/exportImport.ts");
      const data = new Uint8Array(await file.arrayBuffer());
      const result = await parseImport(data, {
        stall: await db.stall.get(STALL_ID),
        menus: await db.menus.toArray(),
      });
      if (result.ok) {
        setImportOpen(false);
        setPlan(result.plan);
      } else {
        setIssues(result.issues);
      }
    } catch {
      setIssues([{ code: "unreadable", where: file.name }]);
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    if (plan === null) {
      return;
    }
    setBusy(true);
    try {
      const { applyImport } = await import("../db/exportImport.ts");
      await applyImport(db, plan);
      setPlan(null);
      toast.show(t("transfer.imported"));
      navigate("/today");
    } catch {
      toast.show(t("common.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const importBlock = (
    <>
      <div
        className={
          compact ? "transfer__block transfer__block--sheet" : "transfer__block"
        }
      >
        {compact ? null : <h3>{t("transfer.import.title")}</h3>}
        <p className="field__hint">{t("transfer.import.hint")}</p>
        <input
          ref={input}
          id={fileId}
          className="visually-hidden"
          type="file"
          accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            void onFile(event);
          }}
        />
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            input.current?.click();
          }}
        >
          {t("transfer.import.action")}
        </Button>
        <label className="visually-hidden" htmlFor={fileId}>
          {t("transfer.import.file")}
        </label>
      </div>

      {issues.length === 0 ? null : (
        <div className="note note--error" role="alert">
          <p>{t("transfer.issues.title")}</p>
          <ul>
            {issues.map((issue, index) => (
              <li key={`${issue.where}-${index}`}>
                {t(`transfer.issue.${issue.code}` as MessageKey, {
                  where: issue.where,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  const confirmSheet = (
    <Sheet
      open={plan !== null}
      title={t("transfer.confirm.title")}
      onClose={() => {
        setPlan(null);
      }}
    >
      <p>
        {plan?.kind === "merge"
          ? t("transfer.confirm.merge", {
              days: new Set(plan.menuDays.map((item) => item.date)).size,
            })
          : t("transfer.confirm.replace", {
              menus: plan?.kind === "replace" ? plan.backup.menus.length : 0,
              days: plan?.kind === "replace" ? plan.backup.days.length : 0,
            })}
      </p>
      <div className="form__actions">
        <Button
          variant="secondary"
          onClick={() => {
            setPlan(null);
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          variant={plan?.kind === "merge" ? "primary" : "danger"}
          disabled={busy}
          onClick={() => {
            void onConfirm();
          }}
        >
          {t("transfer.confirm.action")}
        </Button>
      </div>
    </Sheet>
  );

  if (compact) {
    return (
      <>
        <Button
          wide
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setImportOpen(true);
          }}
        >
          {t("transfer.import.title")}
        </Button>
        <Sheet
          open={importOpen}
          title={t("transfer.import.title")}
          onClose={() => {
            setImportOpen(false);
          }}
        >
          {importBlock}
        </Sheet>
        {confirmSheet}
      </>
    );
  }

  return (
    <div className="transfer">
      <div className="transfer__block">
        <h3>{t("transfer.export.title")}</h3>
        <fieldset className="segmented segmented--even">
          <legend>{t("transfer.format")}</legend>
          <div className="segmented__options">
            {FORMATS.map((option) => (
              <label key={option} className="segmented__option">
                <input
                  type="radio"
                  name="export-format"
                  value={option}
                  checked={format === option}
                  onChange={() => {
                    setFormat(option);
                  }}
                />
                <span>{t(`transfer.format.${option}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="field__hint">{t(`transfer.hint.${format}`)}</p>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            void onExport();
          }}
        >
          {t("transfer.export.action")}
        </Button>
      </div>
      {importBlock}
      {confirmSheet}
    </div>
  );
}
