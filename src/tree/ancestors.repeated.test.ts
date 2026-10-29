import { describe, expect, it } from 'vitest';
import type { Couple, Person, PersonRef, PersonSource, ViewTree } from '@/domain';
import { buildAncestorTree } from './ancestors';

const ref = (id: string, gender: PersonRef['gender'] = 'unknown'): PersonRef => ({
  id,
  name: `${id} Example`,
  gender,
  living: false,
});

const bare = (id: string): Person => ({
  id,
  name: `${id} Example`,
  gender: 'unknown',
  living: false,
  parentSets: [],
  unions: [],
});

function withParents(id: string, father: PersonRef, mother: PersonRef): Person {
  const couple: Couple = { partner1: father, partner2: mother, children: [], preferred: true };
  return { ...bare(id), parentSets: [couple] };
}

async function lastTree(source: PersonSource): Promise<ViewTree> {
  let last: ViewTree | undefined;
  for await (const tree of buildAncestorTree('R', source, { generations: 'all' })) last = tree;
  if (!last) throw new Error('no tree was built');
  return last;
}

/** The root's father and mother are both children of the same grandparent couple: P is reached twice. */
const collapsed = new Map<string, Person>([
  ['R', withParents('R', ref('F', 'male'), ref('M', 'female'))],
  ['F', withParents('F', ref('P', 'male'), ref('Q1', 'female'))],
  ['M', withParents('M', ref('P', 'male'), ref('Q2', 'female'))],
  ['P', bare('P')],
  ['Q1', bare('Q1')],
  ['Q2', bare('Q2')],
]);

describe('repeated ancestors (TC-22, FR-11)', () => {
  it('draws the repeated ancestor once, marked, with an edge from each child', async () => {
    const source: PersonSource = { getPerson: async (id) => collapsed.get(id) ?? null };

    const last = await lastTree(source);

    const copies = last.nodes.filter((node) => node.id === 'P');
    expect(copies).toHaveLength(1);
    expect(copies[0]?.person).toMatchObject({ repeated: true });
    expect(last.edges).toContainEqual({ from: 'F', to: 'P', kind: 'parent' });
    expect(last.edges).toContainEqual({ from: 'M', to: 'P', kind: 'parent' });
  });

  it('does not mark an ancestor that appears only once', async () => {
    const source: PersonSource = { getPerson: async (id) => collapsed.get(id) ?? null };
    const last = await lastTree(source);
    const others = last.nodes.filter((node) => node.id !== 'P');
    expect(others.some((node) => 'repeated' in node.person && node.person.repeated === true)).toBe(
      false,
    );
  });
});
