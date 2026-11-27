// src/components/CloseRow.tsx
import type { HHMM } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { Stepper } from "./Stepper.tsx";
import { TimeInput } from "./TimeInput.tsx";

interface CloseRowProps {
  name: string;
  cooked: number;
  soldOutAt: HHMM | null;
  leftover: number | null;
  leftoverError?: string | undefined;
  missedTime: HHMM;
  missedError: string | undefined;
  unknownTime: boolean;
  cancelled: boolean;
  notes: readonly string[];
  onLeftover: (value: number) => void;
  onMissedTime: (value: HHMM) => void;
  onUnknownTime: (value: boolean) => void;
  onCancelSoldOut: () => void;
  onRestoreSoldOut: () => void;
  onEditTime: () => void;
}

export function CloseRow({
  name,
  cooked,
  soldOutAt,
  leftover,
  leftoverError,
  missedTime,
  missedError,
  unknownTime,
  cancelled,
  notes,
  onLeftover,
  onMissedTime,
  onUnknownTime,
  onCancelSoldOut,
  onRestoreSoldOut,
  onEditTime,
}: CloseRowProps) {
  const t = useT();
  return (
    <li
      className="card close-row"
      data-missing={(soldOutAt === null && leftover === null) || undefined}
    >
      <div className="close-row__head">
        <h2 className="close-row__name">{name}</h2>
        <p className="close-row__meta">
          {t("close.cookedOf", { qty: cooked })}
        </p>
      </div>
      {soldOutAt === null ? (
        <>
          {cancelled ? (
            <p className="note note--info">{t("close.cancelledNote")}</p>
          ) : null}
          <Stepper
            label={t("close.leftoverLabel", { name })}
            decreaseLabel={t("plan.decrease", { name })}
            increaseLabel={t("plan.increase", { name })}
            value={leftover}
            min={0}
            max={cooked}
            placeholder={t("close.leftoverPlaceholder")}
            error={leftoverError}
            onChange={onLeftover}
          />
          {leftover === 0 ? (
            <div className="prompt">
              {unknownTime ? (
                <>
                  <p>{t("close.unknownTimeNote")}</p>
                  <Button
                    variant="secondary"
                    className="btn--small"
                    onClick={() => {
                      onUnknownTime(false);
                    }}
                  >
                    {t("close.knownTime")}
                  </Button>
                </>
              ) : (
                <>
                  <TimeInput
                    label={t("close.missedQuestion", { name })}
                    value={missedTime}
                    onChange={onMissedTime}
                    error={missedError}
                  />
                  <p className="field__hint">{t("close.missedHint")}</p>
                  <Button
                    variant="secondary"
                    className="btn--small"
                    onClick={() => {
                      onUnknownTime(true);
                    }}
                  >
                    {t("close.unknownTime")}
                  </Button>
                </>
              )}
            </div>
          ) : null}
          {cancelled ? (
            <Button
              variant="secondary"
              className="btn--small"
              onClick={onRestoreSoldOut}
            >
              {t("close.didSellOut")}
            </Button>
          ) : null}
        </>
      ) : (
        <div className="close-row__soldout">
          <span className="chip">
            {t("close.soldOutChip", { time: soldOutAt })}
          </span>
          <Button
            variant="secondary"
            className="btn--small"
            aria-label={t("service.editTimeLabel", { name })}
            onClick={onEditTime}
          >
            {t("common.edit")}
          </Button>
          <Button
            variant="secondary"
            className="btn--small"
            onClick={onCancelSoldOut}
          >
            {t("close.someLeft")}
          </Button>
        </div>
      )}
      {notes.map((note) => (
        <p key={note} className="field__hint">
          {note}
        </p>
      ))}
    </li>
  );
}
