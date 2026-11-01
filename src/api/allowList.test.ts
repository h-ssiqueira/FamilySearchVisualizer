import { describe, expect, it } from 'vitest';
import { isAllowedRequest } from './allowList';

const BASE = 'https://www.familysearch.org';

describe('isAllowedRequest (TC-60)', () => {
  it('allows the two endpoints of the samples', () => {
    expect(isAllowedRequest(`${BASE}/platform/users/current`, 'GET', BASE)).toBe(true);
    expect(
      isAllowedRequest(`${BASE}/service/tree/tree-data/v8/person/XXXX-XXX/details`, 'GET', BASE),
    ).toBe(true);
    expect(
      isAllowedRequest(`${BASE}/service/tree/tree-data/v8/person/g4nd-jdm/details`, 'get', BASE),
    ).toBe(true);
  });

  it('refuses every method other than GET', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(isAllowedRequest(`${BASE}/platform/users/current`, method, BASE)).toBe(false);
    }
  });

  it('refuses other hosts, protocols and look-alike origins', () => {
    expect(isAllowedRequest('https://evil.example/platform/users/current', 'GET', BASE)).toBe(false);
    expect(isAllowedRequest('http://www.familysearch.org/platform/users/current', 'GET', BASE)).toBe(
      false,
    );
    expect(
      isAllowedRequest('https://www.familysearch.org.evil.example/platform/users/current', 'GET', BASE),
    ).toBe(false);
    expect(
      isAllowedRequest(`${BASE}/platform/users/current`, 'GET', 'http://www.familysearch.org'),
    ).toBe(false);
  });

  it('refuses other paths, query strings, fragments and malformed ids', () => {
    expect(isAllowedRequest(`${BASE}/platform/tree/ancestry`, 'GET', BASE)).toBe(false);
    expect(isAllowedRequest(`${BASE}/platform/users/current?x=1`, 'GET', BASE)).toBe(false);
    expect(isAllowedRequest(`${BASE}/platform/users/current#x`, 'GET', BASE)).toBe(false);
    expect(
      isAllowedRequest(`${BASE}/service/tree/tree-data/v8/person/a%2Fb/details`, 'GET', BASE),
    ).toBe(false);
    expect(
      isAllowedRequest(`${BASE}/service/tree/tree-data/v8/person/XXXX-XXX/other`, 'GET', BASE),
    ).toBe(false);
  });

  it('refuses credentials in the URL and unparsable input', () => {
    expect(isAllowedRequest('https://user:pass@www.familysearch.org/platform/users/current', 'GET', BASE)).toBe(
      false,
    );
    expect(isAllowedRequest('not a url', 'GET', BASE)).toBe(false);
    expect(isAllowedRequest(`${BASE}/platform/users/current`, 'GET', 'not a url')).toBe(false);
  });
});
