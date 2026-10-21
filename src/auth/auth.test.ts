import { describe, expect, it, vi } from 'vitest';
import { tokenStore } from './tokenStore';
import { scrubUrl } from './scrubUrl';
import { startLogin } from './login';

describe('tokenStore', () => {
  it('keeps the token in memory, trims it and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);
    expect(tokenStore.get()).toBeNull();
    expect(tokenStore.set('  synthetic-token  ')).toBe(true);
    expect(tokenStore.get()).toBe('synthetic-token');
    expect(listener).toHaveBeenCalledTimes(1);
    tokenStore.clear();
    expect(tokenStore.get()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    tokenStore.clear();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    tokenStore.set('another');
    expect(listener).toHaveBeenCalledTimes(2);
    tokenStore.clear();
  });

  it('refuses an empty token', () => {
    expect(tokenStore.set('   ')).toBe(false);
    expect(tokenStore.get()).toBeNull();
  });

  it('never writes the token to browser storage (TC-04)', () => {
    tokenStore.set('synthetic-token');
    expect(JSON.stringify({ ...window.localStorage })).not.toContain('synthetic-token');
    expect(JSON.stringify({ ...window.sessionStorage })).not.toContain('synthetic-token');
    tokenStore.clear();
  });
});

function hostAt(href: string) {
  const replaceState = vi.fn();
  return { replaceState, host: { location: { href }, history: { replaceState } } };
}

describe('scrubUrl (TC-08)', () => {
  const base = 'https://h-ssiqueira.github.io/FamilySearchVisualizer/';

  it('takes a token from the query and keeps the other parameters', () => {
    const { host, replaceState } = hostAt(`${base}?access_token=abc&x=1#/`);
    expect(scrubUrl(host)).toEqual({ token: 'abc', changed: true });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/FamilySearchVisualizer/?x=1#/');
  });

  it('takes a token from a fragment made of parameters', () => {
    const { host, replaceState } = hostAt(`${base}#access_token=abc&state=s`);
    expect(scrubUrl(host)).toEqual({ token: 'abc', changed: true });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/FamilySearchVisualizer/');
  });

  it('takes a token from the query of a route fragment', () => {
    const { host, replaceState } = hostAt(`${base}#/tree?token=abc`);
    expect(scrubUrl(host)).toEqual({ token: 'abc', changed: true });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/FamilySearchVisualizer/#/tree');
  });

  it('removes login parameters even when there is no token', () => {
    const { host, replaceState } = hostAt(`${base}?code=c&state=s`);
    expect(scrubUrl(host)).toEqual({ changed: true });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/FamilySearchVisualizer/');
  });

  it('leaves a clean URL alone', () => {
    const { host, replaceState } = hostAt(`${base}#/`);
    expect(scrubUrl(host)).toEqual({ changed: false });
    expect(replaceState).not.toHaveBeenCalled();
  });
});

describe('startLogin (TC-02)', () => {
  it('navigates to the configured FamilySearch login address', () => {
    const navigate = vi.fn();
    startLogin('https://ident.familysearch.org/oauth2/authorization/google', navigate);
    expect(navigate).toHaveBeenCalledWith('https://ident.familysearch.org/oauth2/authorization/google');
  });

  it('refuses any other address', () => {
    const navigate = vi.fn();
    expect(() => startLogin('https://evil.example/login', navigate)).toThrow();
    expect(() => startLogin('http://ident.familysearch.org/login', navigate)).toThrow();
    expect(navigate).not.toHaveBeenCalled();
  });
});
