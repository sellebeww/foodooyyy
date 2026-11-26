// src/i18n/I18nProvider.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  I18nContext,
  readStoredLanguage,
  translate,
  writeStoredLanguage,
  type I18nValue,
  type Language,
  type MessageKey,
  type MessageParams,
} from "./index.ts";

interface I18nProviderProps {
  children: ReactNode;
  storage?: Storage | undefined;
}

function defaultStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function I18nProvider({
  children,
  storage = defaultStorage(),
}: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    readStoredLanguage(storage),
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(
    (next: Language) => {
      writeStoredLanguage(storage, next);
      setLanguageState(next);
    },
    [storage],
  );

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key: MessageKey, params?: MessageParams) =>
        translate(language, key, params),
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
