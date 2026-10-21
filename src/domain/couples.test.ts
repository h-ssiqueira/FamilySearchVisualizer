import { describe, expect, it } from 'vitest';
import { partnerOf, preferredCouple, siblingsIn } from './couples';
import { toGender } from './gender';
import type { Couple, PersonRef } from './types';

const ref = (id: string): PersonRef => ({ id, name: id, gender: 'unknown', living: false });

describe('partnerOf', () => {
  it('returns the partner whose id differs from the person, whichever slot it is in', () => {
    const first: Couple = { partner1: ref('SPOUSE'), partner2: ref('ME'), children: [], preferred: true };
    const second: Couple = { partner1: ref('ME'), partner2: ref('SPOUSE'), children: [], preferred: true };
    expect(partnerOf('ME', first)?.id).toBe('SPOUSE');
    expect(partnerOf('ME', second)?.id).toBe('SPOUSE');
  });

  it('returns undefined when there is no other partner', () => {
    expect(partnerOf('ME', { partner1: ref('ME'), children: [], preferred: false })).toBeUndefined();
  });
});

describe('siblingsIn', () => {
  it('excludes the person from their parents children', () => {
    const couple: Couple = {
      children: [ref('ME'), ref('SIBLING')],
      preferred: true,
    };
    expect(siblingsIn('ME', couple).map((child) => child.id)).toEqual(['SIBLING']);
  });
});

describe('preferredCouple', () => {
  it('prefers the flagged family, otherwise the first, otherwise nothing', () => {
    const a: Couple = { children: [], preferred: false };
    const b: Couple = { children: [], preferred: true };
    expect(preferredCouple([a, b])).toBe(b);
    expect(preferredCouple([a])).toBe(a);
    expect(preferredCouple([])).toBeUndefined();
  });
});

describe('toGender', () => {
  it('maps API values and treats anything else as unknown', () => {
    expect(toGender('MALE')).toBe('male');
    expect(toGender(' female ')).toBe('female');
    expect(toGender('OTHER')).toBe('unknown');
    expect(toGender(null)).toBe('unknown');
    expect(toGender(undefined)).toBe('unknown');
  });
});
