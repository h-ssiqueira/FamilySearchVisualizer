import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  acceptLanguageFor,
  applyPreferredLocale,
  detectLocale,
  getLocale,
  matchLocale,
  messagesFor,
  setLocale,
  translate,
} from './index';

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('catalogs (TC-57)', () => {
  it('have exactly the same keys in every supported locale', () => {
    const reference = Object.keys(messagesFor(DEFAULT_LOCALE)).sort();
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(messagesFor(locale)).sort()).toEqual(reference);
    }
  });

  it('have no empty message', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const [key, value] of Object.entries(messagesFor(locale))) {
        expect(value.trim(), `${locale}: ${key}`).not.toBe('');
      }
    }
  });
});

describe('matchLocale / detectLocale', () => {
  it('matches exactly, then by primary language, ignoring case', () => {
    expect(matchLocale('pt-BR')).toBe('pt-BR');
    expect(matchLocale('PT-br')).toBe('pt-BR');
    expect(matchLocale('pt-PT')).toBe('pt-BR');
    expect(matchLocale('pt')).toBe('pt-BR');
    expect(matchLocale('en-US')).toBe('en');
    expect(matchLocale('fr')).toBeUndefined();
    expect(matchLocale(null)).toBeUndefined();
  });

  it('prefers the saved choice, then the FamilySearch preference, then the browser', () => {
    expect(detectLocale({ saved: 'en', preferred: 'pt', languages: ['pt-BR'] })).toBe('en');
    expect(detectLocale({ preferred: 'pt', languages: ['en-US'] })).toBe('pt-BR');
    expect(detectLocale({ languages: ['fr-FR', 'pt-PT', 'en'] })).toBe('pt-BR');
  });

  it('falls back to English', () => {
    expect(detectLocale({ languages: ['fr', 'de'] })).toBe('en');
    expect(detectLocale({})).toBe('en');
  });
});

describe('translate', () => {
  it('uses the locale catalog and falls back to English, then to the key', () => {
    expect(translate('en', 'login.button')).toBe('Sign in with Google (FamilySearch)');
    expect(translate('pt-BR', 'login.button')).toBe('Entrar com Google (FamilySearch)');
    expect(translate('pt-BR', 'no.such.key')).toBe('no.such.key');
  });

  it('maps pt-BR to the pt value of Accept-Language', () => {
    expect(acceptLanguageFor('pt-BR')).toBe('pt');
    expect(acceptLanguageFor('en')).toBe('en');
  });
});

describe('locale state', () => {
  it('changes the locale, the document language and remembers the choice', () => {
    setLocale('pt-BR');
    expect(getLocale()).toBe('pt-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(window.localStorage.getItem('fsv.locale')).toBe('pt-BR');
  });

  it('applies the FamilySearch language preference only when the user has not chosen', () => {
    applyPreferredLocale('pt');
    expect(getLocale()).toBe('pt-BR');
    setLocale('en');
    applyPreferredLocale('pt');
    expect(getLocale()).toBe('en');
  });
});
