// src/components/EntryActions.tsx
import { useEntryActions } from "../app/useEntryActions.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";
import { PlayIcon } from "./icons/PlayIcon.tsx";

interface EntryActionsProps {
  className?: string;
}

export function EntryActions({ className = "" }: EntryActionsProps) {
  const t = useT();
  const { primary, secondary, note, busy, failed } = useEntryActions();
  const launching = primary.label === "landing.cta.launch";
  return (
    <div className={`entry ${className}`.trim()}>
      <div className="entry__buttons">
        <Button
          disabled={busy}
          icon={launching ? <PlayIcon /> : <ArrowIcon />}
          onClick={primary.run}
        >
          {t(primary.label)}
        </Button>
        {secondary === null ? null : (
          <Button variant="secondary" disabled={busy} onClick={secondary.run}>
            {t(secondary.label)}
          </Button>
        )}
      </div>
      {note === null ? null : <p className="entry__note">{t(note)}</p>}
      {failed ? (
        <p className="form__failure" role="alert">
          {t("common.saveFailed")}
        </p>
      ) : null}
    </div>
  );
}
