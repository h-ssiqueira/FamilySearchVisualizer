import { describe, expect, it, vi } from 'vitest';
import { createFamilySearchClient } from './familySearchClient';
import { HttpError } from './errors';
import { RequestQueue } from './requestQueue';

const userBody = { users: [{ personId: 'XXXX-XXX', displayName: 'John Example', gender: 'MALE' }] };

function clientWith(fetchImpl: typeof fetch, networkRetries = 3) {
  return createFamilySearchClient({
    apiBase: 'https://www.familysearch.org',
    getToken: () => 'synthetic-token',
    getAcceptLanguage: () => 'en',
    queue: new RequestQueue({ concurrency: 1, maxRetries: 0 }),
    fetchImpl,
    networkRetries,
    backoffBaseMs: 1,
  });
}

describe('network back-off (NFR-03, TC-42)', () => {
  it('retries a network failure and then gets the answer', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify(userBody), { status: 200 }));

    const user = await clientWith(fetchImpl as unknown as typeof fetch).getCurrentUser();

    expect(user.personId).toBe('XXXX-XXX');
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('gives up after the configured retries and reports the network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      clientWith(fetchImpl as unknown as typeof fetch, 2).getCurrentUser(),
    ).rejects.toBeInstanceOf(TypeError);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('does not retry an HTTP error answer (throttling is the queue job)', async () => {
    const fetchImpl = vi.fn(async () => new Response('', { status: 500 }));

    await expect(
      clientWith(fetchImpl as unknown as typeof fetch).getCurrentUser(),
    ).rejects.toBeInstanceOf(HttpError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
