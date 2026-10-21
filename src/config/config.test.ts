import { describe, expect, it } from 'vitest';
import { isAllowedLoginUrl, readConfig } from './index';

const valid = {
  VITE_BASE_PATH: '/FamilySearchVisualizer/',
  VITE_FS_API_BASE: 'https://www.familysearch.org',
  VITE_FS_LOGIN_URL: 'https://ident.familysearch.org/oauth2/authorization/google',
};

describe('readConfig', () => {
  it('accepts the documented settings', () => {
    const result = readConfig(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.basePath).toBe('/FamilySearchVisualizer/');
      expect(result.config.loginUrl).toBe(valid.VITE_FS_LOGIN_URL);
      expect(new URL(result.config.apiBase).origin).toBe('https://www.familysearch.org');
    }
  });

  it('names the missing or invalid settings and never a value', () => {
    expect(readConfig({})).toEqual({
      ok: false,
      missing: ['VITE_FS_LOGIN_URL', 'VITE_FS_API_BASE'],
    });
    expect(
      readConfig({ ...valid, VITE_FS_LOGIN_URL: 'https://evil.example/login' }),
    ).toEqual({ ok: false, missing: ['VITE_FS_LOGIN_URL'] });
    expect(readConfig({ ...valid, VITE_FS_API_BASE: 'http://www.familysearch.org' })).toEqual({
      ok: false,
      missing: ['VITE_FS_API_BASE'],
    });
  });

  it('defaults the base path to the root', () => {
    const result = readConfig({ ...valid, VITE_BASE_PATH: undefined });
    expect(result.ok && result.config.basePath).toBe('/');
  });
});

describe('isAllowedLoginUrl', () => {
  it('accepts https addresses of familysearch.org only', () => {
    expect(isAllowedLoginUrl('https://ident.familysearch.org/oauth2/authorization/google')).toBe(true);
    expect(isAllowedLoginUrl('https://familysearch.org/')).toBe(true);
    expect(isAllowedLoginUrl('http://ident.familysearch.org/')).toBe(false);
    expect(isAllowedLoginUrl('https://familysearch.org.evil.example/')).toBe(false);
    expect(isAllowedLoginUrl('https://notfamilysearch.org/')).toBe(false);
    expect(isAllowedLoginUrl('not a url')).toBe(false);
  });
});
