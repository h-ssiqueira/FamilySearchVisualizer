import { describe, expect, it } from 'vitest';
import type { Couple, Person, PersonRef, ViewTree } from '@/domain';
import { buildFamilyView } from './family';

const ref = (id: string, gender: PersonRef['gender'] = 'unknown'): PersonRef => ({
  id,
  name: `${id} Example`,
  gender,
  living: false,
});

const union = (spouse: PersonRef, preferred: boolean): Couple => ({
  partner1: ref('R', 'male'),
  partner2: spouse,
  children: [],
  preferred,
});

function rootWith(unions: Couple[]): ViewTree {
  const root: Person = {
    id: 'R',
    name: 'R Example',
    gender: 'male',
    living: false,
    parentSets: [],
    unions,
  };
  return {
    view: 'V1',
    root: 'R',
    nodes: [{ id: 'R', person: root, generation: 0, slot: 0, role: 'root' }],
    edges: [],
    pending: [],
    failed: [],
  };
}

const spouseIds = (view: ReturnType<typeof buildFamilyView>): string[] =>
  view.cards.filter((card) => card.role === 'spouse').map((card) => card.id);

describe('families button (OQ-23, OQ-25)', () => {
  it('tells how many families the person has, and which one is shown', () => {
    const view = buildFamilyView(
      rootWith([union(ref('S1', 'female'), false), union(ref('S2', 'female'), false)]),
      'V2',
    );
    const root = view.cards.find((card) => card.id === 'R');
    expect(root?.families).toEqual({ total: 2, shown: 1 });
  });

  it('shows only the chosen family when the user has pressed the button', () => {
    const view = buildFamilyView(
      rootWith([union(ref('S1', 'female'), false), union(ref('S2', 'female'), false)]),
      'V2',
      new Map([['R', 1]]),
    );
    expect(spouseIds(view)).toEqual(['S2']);
    expect(view.cards.find((card) => card.id === 'R')?.families).toEqual({ total: 2, shown: 2 });
  });

  it('wraps the choice around the number of families', () => {
    const view = buildFamilyView(
      rootWith([union(ref('S1', 'female'), false), union(ref('S2', 'female'), false)]),
      'V2',
      new Map([['R', 2]]),
    );
    expect(spouseIds(view)).toEqual(['S1']);
  });

  it('has no button for a person with only one family', () => {
    const view = buildFamilyView(rootWith([union(ref('S1', 'female'), true)]), 'V2');
    expect(view.cards.find((card) => card.id === 'R')?.families).toBeUndefined();
  });
});
