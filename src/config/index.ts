export interface AppConfig {
  basePath: string;
  loginUrl: string;
  apiBase: string;
}

export type ConfigResult = { ok: true; config: AppConfig } | { ok: false; missing: string[] };

/** The login address must be an https address of familysearch.org (SDD auth, section 2). */
export function isAllowedLoginUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === 'https:' && (host === 'familysearch.org' || host.endsWith('.familysearch.org'))
    );
  } catch {
    return false;
  }
}

function httpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Validates the public build-time settings. Names of the invalid ones are reported. */
export function readConfig(env: Record<string, unknown>): ConfigResult {
  const missing: string[] = [];

  const loginUrl = httpsUrl(env.VITE_FS_LOGIN_URL);
  if (!loginUrl || !isAllowedLoginUrl(loginUrl)) missing.push('VITE_FS_LOGIN_URL');

  const apiBase = httpsUrl(env.VITE_FS_API_BASE);
  if (!apiBase) missing.push('VITE_FS_API_BASE');

  if (!loginUrl || !apiBase || missing.length > 0) return { ok: false, missing };

  const basePath =
    typeof env.VITE_BASE_PATH === 'string' && env.VITE_BASE_PATH !== '' ? env.VITE_BASE_PATH : '/';
  return { ok: true, config: { basePath, loginUrl, apiBase } };
}

export function loadConfig(): ConfigResult {
  return readConfig(import.meta.env as Record<string, unknown>);
}
