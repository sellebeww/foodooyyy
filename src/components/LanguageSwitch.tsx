// src/components/LanguageSwitch.tsx
import { LANGUAGES, useI18n } from "../i18n/index.ts";

interface LanguageSwitchProps {
  compact?: boolean;
}

export function LanguageSwitch({ compact = false }: LanguageSwitchProps) {
  const { language, setLanguage, t } = useI18n();
  return (
    <fieldset className={compact ? "segmented lang" : "segmented"}>
      <legend className={compact ? "visually-hidden" : undefined}>
        {t("lang.label")}
      </legend>
      <div className="segmented__options">
        {LANGUAGES.map((option) => (
          <label key={option} className="segmented__option">
            <input
              type="radio"
              name="language"
              value={option}
              checked={language === option}
              onChange={() => {
                setLanguage(option);
              }}
            />
            {compact ? (
              <>
                <span className="lang__short" aria-hidden="true">
                  {option.toUpperCase()}
                </span>
                <span className="visually-hidden" lang={option}>
                  {t(`lang.${option}`)}
                </span>
              </>
            ) : (
              <span lang={option}>{t(`lang.${option}`)}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
