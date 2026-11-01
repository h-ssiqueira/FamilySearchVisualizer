import { useCallback, useSyncExternalStore } from 'react';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

// Adding a language = adding a JSON catalog and listing it here (SDD ADR-11).
export const SUPPORTED_LOCALES = ['en', 'pt-BR'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'fsv.locale';

export interface Catalog {
  [key: string]: string | Catalog;
}
export type Messages = Record<string, string>;

export function flatten(catalog: Catalog, prefix = ''): Messages {
  const out: Messages = {};
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

const messages: Record<Locale, Messages> = { en: flatten(en), 'pt-BR': flatten(ptBR) };

export function messagesFor(locale: Locale): Messages {
  return messages[locale];
}

/** Matches a language tag to a supported locale: exact first, then by primary subtag. */
export function matchLocale(tag: string | null | undefined): Locale | undefined {
  if (!tag) return undefined;
  const lower = tag.trim().toLowerCase();
  const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === lower);
  if (exact) return exact;
  const primary = lower.split('-')[0];
  return SUPPORTED_LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === primary);
}

export interface DetectInput {
  saved?: string | null;
  preferred?: string | null;
  languages?: readonly string[];
}

/** Saved choice, then the user's FamilySearch preference, then the browser languages. */
export function detectLocale(input: DetectInput): Locale {
  const fromBrowser = (input.languages ?? []).map((tag) => matchLocale(tag)).find(Boolean);
  return matchLocale(input.saved) ?? matchLocale(input.preferred) ?? fromBrowser ?? DEFAULT_LOCALE;
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const template = messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key;
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => String(vars?.[name] ?? ''));
}

/** Value of the `Accept-Language` header sent to FamilySearch: `pt-BR` becomes `pt`. */
export function acceptLanguageFor(locale: Locale): string {
  return locale.split('-')[0] ?? locale;
}

function readSavedLocale(): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage may be unavailable (private mode): the choice then lasts for this session only.
  }
}

function applyDocumentLanguage(locale: Locale): void {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

let current: Locale = detectLocale({
  saved: readSavedLocale(),
  languages: typeof navigator === 'undefined' ? [] : navigator.languages,
});
applyDocumentLanguage(current);

const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return current;
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLocale(locale: Locale, persist = true): void {
  if (locale === current) return;
  current = locale;
  if (persist) saveLocale(locale);
  applyDocumentLanguage(locale);
  listeners.forEach((listener) => listener());
}

/** Applies the language preference from `users/current` unless the user already chose one. */
export function applyPreferredLocale(preferred: string | null | undefined): void {
  if (readSavedLocale()) return;
  const match = matchLocale(preferred);
  if (match) setLocale(match, false);
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale, getLocale);
}

export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  const locale = useLocale();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );
}
