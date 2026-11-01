const ALLOWED_PATHS: readonly RegExp[] = [
  /^\/platform\/users\/current$/,
  /^\/service\/tree\/tree-data\/v8\/person\/[A-Z0-9]{2,8}-[A-Z0-9]{2,8}\/details$/i,
];

/**
 * Only GET, only on the API origin, only the endpoints of the samples (SDD NFR-11, TC-60).
 * Anything else is refused before a request is made.
 */
export function isAllowedRequest(url: string, method: string, apiBase: string): boolean {
  if (method.toUpperCase() !== 'GET') return false;
  let target: URL;
  let base: URL;
  try {
    target = new URL(url);
    base = new URL(apiBase);
  } catch {
    return false;
  }
  if (base.protocol !== 'https:' || target.origin !== base.origin) return false;
  if (target.search !== '' || target.hash !== '' || target.username !== '' || target.password !== '') {
    return false;
  }
  return ALLOWED_PATHS.some((pattern) => pattern.test(target.pathname));
}
