// src/i18n/index.ts
import { createContext, useContext } from "react";
import { en } from "./en.ts";
import { id } from "./id.ts";

export type Language = "en" | "id";
export type MessageKey = keyof typeof en;
export type MessageParams = Readonly<Record<string, string | number>>;
export type Translate = (key: MessageKey, params?: MessageParams) => string;

export const LANGUAGES: readonly Language[] = ["en", "id"];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "foodoo.language";

const dictionaries: Record<Language, Record<MessageKey, string>> = { en, id };

export function translate(
  language: Language,
  key: MessageKey,
  params: MessageParams = {},
): string {
  return dictionaries[language][key].replace(
    /\{(\w+)\}/g,
    (placeholder, name: string) => {
      const value = params[name];
      return value === undefined ? placeholder : String(value);
    },
  );
}

export function t(key: MessageKey, params?: MessageParams): string {
  return translate(DEFAULT_LANGUAGE, key, params);
}

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "id";
}

export function readStoredLanguage(
  storage: Pick<Storage, "getItem"> | undefined,
): Language {
  try {
    const stored = storage?.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function writeStoredLanguage(
  storage: Pick<Storage, "setItem"> | undefined,
  language: Language,
): void {
  try {
    storage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    return;
  }
}

export interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
}

export const I18nContext = createContext<I18nValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  t,
});

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function useT(): Translate {
  return useContext(I18nContext).t;
}
