import { describe, expect, it } from 'vitest';
import { partnerOf } from '@/domain';
import { syntheticCurrentUserResponse, syntheticPersonResponse } from '@/test/fixtures/synthetic';
import { SchemaError } from './errors';
import { parseCurrentUser, parsePerson } from './mappers';

describe('parsePerson', () => {
  const person = parsePerson(syntheticPersonResponse);

  it('maps the person, dates and places', () => {
    expect(person.id).toBe('XXXX-XXX');
    expect(person.name).toBe('John Example');
    expect(person.gender).toBe('male');
    expect(person.living).toBe(false);
    expect(person.ageAtDeath).toBe(99);
    expect(person.birth?.date).toEqual({ text: '+1800-12-31', source: 'formal' });
    expect(person.birth?.place).toEqual({ id: '1', text: 'São Paulo, São Paulo, Brazil' });
    expect(person.death?.date).toEqual({ text: '+1900-01-01', source: 'formal' });
  });

  it('maps parents, siblings and the preferred flag', () => {
    const family = person.parentSets[0];
    expect(family?.preferred).toBe(true);
    expect(family?.partner1?.id).toBe('AAAA-AAA');
    expect(family?.partner2?.gender).toBe('female');
    expect(family?.children.map((child) => child.id)).toEqual(['XXXX-XXX', 'CCCC-CCC']);
  });

  it('falls back to normalized prose for a marriage without a formal date', () => {
    expect(person.parentSets[0]?.event?.date).toEqual({
      text: '2 July 1799',
      source: 'normalized',
    });
    expect(person.parentSets[0]?.event?.place).toBeUndefined();
  });

  it('identifies the spouse as the partner whose id differs from the person', () => {
    const union = person.unions[0];
    expect(union).toBeDefined();
    if (!union) return;
    expect(partnerOf(person.id, union)?.id).toBe('DDDD-DDD');
    expect(union.children.map((child) => child.id)).toEqual(['EEEE-EEE']);
    expect(union.event?.place?.text).toBe('Campinas, Brazil');
  });

  it('never keeps fields outside the whitelist', () => {
    const dump = JSON.stringify(person);
    expect(dump).not.toContain('synthetic@example.invalid');
    expect(dump).not.toContain('helperAccessPin');
    expect(dump).not.toContain('000000');
    expect(dump).not.toContain('contributors');
  });

  it('treats a missing living flag as deceased and missing lists as empty', () => {
    const minimal = parsePerson({ id: 'AAAA-AAA' });
    expect(minimal).toEqual({
      id: 'AAAA-AAA',
      name: '',
      gender: 'unknown',
      living: false,
      parentSets: [],
      unions: [],
    });
  });

  it('accepts the age as text and ignores a non-numeric age', () => {
    expect(parsePerson({ id: 'AAAA-AAA', ageAtDeath: '42' }).ageAtDeath).toBe(42);
    expect(parsePerson({ id: 'AAAA-AAA', ageAtDeath: 'unknown' }).ageAtDeath).toBeUndefined();
  });

  it('reports only the paths of an invalid response, never its values', () => {
    try {
      parsePerson({ name: 'Secret Name' });
      expect.unreachable('parsePerson should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaError);
      expect((error as SchemaError).paths).toEqual(['id']);
      expect((error as SchemaError).message).not.toContain('Secret Name');
    }
  });
});

describe('parseCurrentUser', () => {
  it('keeps only the whitelisted fields', () => {
    const user = parseCurrentUser(syntheticCurrentUserResponse);
    expect(user).toEqual({
      personId: 'XXXX-XXX',
      displayName: 'John Example',
      gender: 'male',
      birthDate: '31 December 1800',
      preferredLanguage: 'pt',
    });
    expect(JSON.stringify(user)).not.toContain('synthetic@example.invalid');
    expect(JSON.stringify(user)).not.toContain('helperAccessPin');
  });

  it('rejects an empty or malformed response', () => {
    expect(() => parseCurrentUser({ users: [] })).toThrow(SchemaError);
    expect(() => parseCurrentUser({})).toThrow(SchemaError);
  });
});
