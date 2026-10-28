import { describe, expect, it } from 'vitest';
import type { Couple, Person, PersonRef, ViewTree } from '@/domain';
import { buildFamilyView } from './family';

const ref = (id: string, gender: PersonRef['gender'] = 'unknown'): PersonRef => ({
  id,
  name: `${id} Example`,
  gender,
  living: false,
});

function personWithUnions(unions: Couple[]): Person {
  return {
    id: 'R',
    name: 'R Example',
    gender: 'male',
    living: false,
    parentSets: [],
    unions,
  };
}

const union = (spouse: PersonRef, preferred: boolean): Couple => ({
  partner1: ref('R', 'male'),
  partner2: spouse,
  children: [],
  preferred,
});

const rootOnly = (root: Person): ViewTree => ({
  view: 'V1',
  root: 'R',
  nodes: [{ id: 'R', person: root, generation: 0, slot: 0, role: 'root' }],
  edges: [],
  pending: [],
  failed: [],
});

const spouseIds = (person: Person): string[] =>
  buildFamilyView(rootOnly(person), 'V2')
    .cards.filter((card) => card.role === 'spouse')
    .map((card) => card.id);

describe('preferred family (OQ-04, FR-30)', () => {
  it('shows only the preferred spouse family when one is flagged', () => {
    const person = personWithUnions([union(ref('S1', 'female'), false), union(ref('S2', 'female'), true)]);
    expect(spouseIds(person)).toEqual(['S2']);
  });

  it('shows every spouse family when none is flagged', () => {
    const person = personWithUnions([union(ref('S1', 'female'), false), union(ref('S2', 'female'), false)]);
    expect(spouseIds(person)).toEqual(['S1', 'S2']);
  });
});
