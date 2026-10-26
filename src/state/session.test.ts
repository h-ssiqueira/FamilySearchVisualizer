import { afterEach, describe, expect, it } from 'vitest';
import { tokenStore } from '@/auth';
import type { Person } from '@/domain';
import { personCache } from './cache';
import { expireSession, isSessionExpired, signOut } from './session';
import { viewStore } from './viewStore';

const person: Person = {
  id: 'AAAA-AAA',
  name: 'A',
  gender: 'unknown',
  living: false,
  parentSets: [],
  unions: [],
};

afterEach(() => {
  signOut();
});

describe('session expiry and sign-out (FR-03, FR-04, TC-06)', () => {
  it('after an expiry the token goes, but the tree and the open view stay', () => {
    tokenStore.set('synthetic-token');
    personCache.set(person);
    viewStore.set('V3');

    expireSession();

    expect(tokenStore.get()).toBeNull();
    expect(personCache.has('AAAA-AAA')).toBe(true);
    expect(viewStore.get()).toBe('V3');
    expect(isSessionExpired()).toBe(true);
  });

  it('an explicit sign-out wipes the tree, the view and the expiry notice', () => {
    tokenStore.set('synthetic-token');
    personCache.set(person);
    viewStore.set('V2');
    expireSession();

    signOut();

    expect(personCache.size).toBe(0);
    expect(viewStore.get()).toBe('V1');
    expect(isSessionExpired()).toBe(false);
  });
});
