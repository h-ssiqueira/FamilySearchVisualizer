import { describe, expect, it } from 'vitest';
import type { FamilySearchClient } from '@/api';
import { HttpError, UnavailableError } from '@/api';
import type { Person } from '@/domain';
import { tokenStore } from '@/auth';
import { PersonCache } from './cache';
import { createPersonSource } from './personSource';
import { personCache } from './cache';
import { signOut } from './session';

const person = (id: string): Person => ({
  id,
  name: id,
  gender: 'unknown',
  living: false,
  parentSets: [],
  unions: [],
});

function fakeClient(
  impl: (id: string) => Promise<Person>,
): FamilySearchClient & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    getCurrentUser: () => Promise.reject(new Error('not used')),
    getPersonDetails: (id) => {
      calls.push(id);
      return impl(id);
    },
  };
}

describe('createPersonSource', () => {
  it('requests a person once and serves the second call from the cache (TC-16)', async () => {
    const client = fakeClient(async (id) => person(id));
    const source = createPersonSource(client, new PersonCache());
    expect((await source.getPerson('AAAA-AAA'))?.id).toBe('AAAA-AAA');
    expect((await source.getPerson('AAAA-AAA'))?.id).toBe('AAAA-AAA');
    expect(client.calls).toEqual(['AAAA-AAA']);
  });

  it('shares one request between simultaneous callers', async () => {
    const client = fakeClient(async (id) => person(id));
    const source = createPersonSource(client, new PersonCache());
    const [first, second] = await Promise.all([
      source.getPerson('AAAA-AAA'),
      source.getPerson('AAAA-AAA'),
    ]);
    expect(first).toBe(second);
    expect(client.calls).toHaveLength(1);
  });

  it('reports restricted or missing people as null (TC-43)', async () => {
    const client = fakeClient(() => Promise.reject(new UnavailableError(404)));
    const source = createPersonSource(client, new PersonCache());
    await expect(source.getPerson('AAAA-AAA')).resolves.toBeNull();
  });

  it('lets other errors through and does not cache them', async () => {
    const cache = new PersonCache();
    const client = fakeClient(() => Promise.reject(new HttpError(500)));
    const source = createPersonSource(client, cache);
    await expect(source.getPerson('AAAA-AAA')).rejects.toBeInstanceOf(HttpError);
    expect(cache.has('AAAA-AAA')).toBe(false);
    await expect(source.getPerson('AAAA-AAA')).rejects.toBeInstanceOf(HttpError);
    expect(client.calls).toHaveLength(2);
  });
});

describe('signOut (TC-06)', () => {
  it('clears the token and the cached family data', () => {
    tokenStore.set('synthetic-token');
    personCache.set(person('AAAA-AAA'));
    signOut();
    expect(tokenStore.get()).toBeNull();
    expect(personCache.size).toBe(0);
  });
});
