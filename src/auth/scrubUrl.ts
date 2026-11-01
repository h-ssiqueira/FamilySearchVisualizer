const SENSITIVE_PARAMS = new Set(['access_token', 'token', 'id_token', 'code', 'state']);
const TOKEN_PARAMS = ['access_token', 'token'];

export interface UrlHost {
  location: { href: string };
  history: {
    replaceState: (data: unknown, unused: string, url?: string | URL | null) => void;
  };
}

export interface ScrubResult {
  token?: string;
  changed: boolean;
}

/**
 * Removes token-like parameters from the query and from the fragment (also `#/route?token=...`)
 * and returns the token found, if any. PROVISIONAL: how the token really reaches the page is
 * still to be confirmed by the spike (SDD OQ-21); this only guarantees it never stays in the URL.
 */
export function scrubUrl(host: UrlHost): ScrubResult {
  const url = new URL(host.location.href);
  let token: string | undefined;
  let changed = false;

  const take = (params: URLSearchParams): void => {
    for (const key of [...params.keys()]) {
      if (!SENSITIVE_PARAMS.has(key)) continue;
      if (TOKEN_PARAMS.includes(key) && token === undefined) token = params.get(key) ?? undefined;
      params.delete(key);
      changed = true;
    }
  };

  const query = new URLSearchParams(url.search);
  take(query);

  const rawHash = url.hash.slice(1);
  let hashRoute = rawHash;
  let hashQuery = new URLSearchParams();
  if (rawHash.startsWith('/')) {
    const separator = rawHash.indexOf('?');
    if (separator >= 0) {
      hashRoute = rawHash.slice(0, separator);
      hashQuery = new URLSearchParams(rawHash.slice(separator + 1));
    }
  } else if (rawHash.includes('=')) {
    hashRoute = '';
    hashQuery = new URLSearchParams(rawHash);
  }
  take(hashQuery);

  if (changed) {
    const search = query.toString();
    const remainingHashQuery = hashQuery.toString();
    let hash = hashRoute;
    if (remainingHashQuery) hash += (hashRoute.startsWith('/') ? '?' : '') + remainingHashQuery;
    const clean = url.pathname + (search ? `?${search}` : '') + (hash ? `#${hash}` : '');
    host.history.replaceState(null, '', clean);
  }

  return token === undefined ? { changed } : { token, changed };
}
