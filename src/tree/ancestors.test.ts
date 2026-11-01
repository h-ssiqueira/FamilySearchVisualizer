import { describe, expect, it } from 'vitest';
import type { Couple, Gender, Person, PersonRef, PersonSource } from '@/domain';
import { assignParentSlots, buildAncestorTree } from './ancestors';

const ref = (id: string, gender: Gender = 'unknown'): PersonRef => ({
  id,
  name: id,
  gender,
  living: false,
});

function person(id: string, parents: PersonRef[] = []): Person {
  const [partner1, partner2] = parents;
  const couple: Couple = { children: [], preferred: true };
  if (partner1) couple.partner1 = partner1;
  if (partner2) couple.partner2 = partner2;
  return {
    id,
    name: id,
    gender: 'unknown',
    living: false,
    parentSets: parents.length > 0 ? [couple] : [],
    unions: [],
  };
}

function sourceOf(people: Person[]): PersonSource & { calls: string[] } {
  const byId = new Map(people.map((entry) => [entry.id, entry] as const));
  const calls: string[] = [];
  return {
    calls,
    async getPerson(id) {
      calls.push(id);
      return byId.get(id) ?? null;
    },
  };
}

async function collect<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const value of generator) out.push(value);
  return out;
}

const family = [
  person('R', [ref('F', 'male'), ref('M', 'female')]),
  person('F', [ref('GF1', 'male'), ref('GM1', 'female')]),
  person('M'),
  person('GF1'),
  person('GM1'),
];

describe('buildAncestorTree', () => {
  it('yields one tree per generation and stops when no parents are known (TC-20, TC-21)', async () => {
    const trees = await collect(buildAncestorTree('R', sourceOf(family), { generations: 'all' }));
    expect(trees.map((tree) => tree.nodes.length)).toEqual([1, 3, 5]);
    const last = trees.at(-1);
    expect(last?.nodes.map((node) => node.id)).toEqual(['R', 'F', 'M', 'GF1', 'GM1']);
    expect(last?.nodes[0]?.role).toBe('root');
    expect(last?.nodes[1]?.role).toBe('ancestor');
  });

  it('respects the generation limit and does not load beyond it', async () => {
    const source = sourceOf(family);
    const trees = await collect(buildAncestorTree('R', source, { generations: 1 }));
    expect(trees).toHaveLength(2);
    expect(trees.at(-1)?.nodes.map((node) => node.id)).toEqual(['R', 'F', 'M']);
    expect(source.calls).not.toContain('GF1');
  });

  it('can load the next generation by asking for one more', async () => {
    const trees = await collect(buildAncestorTree('R', sourceOf(family), { generations: 2 }));
    expect(trees.at(-1)?.nodes).toHaveLength(5);
  });

  it('places the man on the left and the woman on the right, whichever order the API gives', async () => {
    const people = [person('R', [ref('M', 'female'), ref('F', 'male')]), person('F'), person('M')];
    const last = (await collect(buildAncestorTree('R', sourceOf(people), { generations: 1 }))).at(-1);
    const slotOf = (id: string) => last?.nodes.find((node) => node.id === id)?.slot;
    expect(slotOf('F')).toBe(0);
    expect(slotOf('M')).toBe(1);
  });

  it('draws a repeated ancestor once, with an edge from each child (pedigree collapse, TC-22)', async () => {
    const people = [
      person('R', [ref('F'), ref('M')]),
      person('F', [ref('P'), ref('Q1')]),
      person('M', [ref('P'), ref('Q2')]),
      person('P'),
      person('Q1'),
      person('Q2'),
    ];
    const last = (await collect(buildAncestorTree('R', sourceOf(people), { generations: 'all' }))).at(-1);
    expect(last?.nodes.filter((node) => node.id === 'P')).toHaveLength(1);
    expect(last?.edges).toContainEqual({ from: 'F', to: 'P', kind: 'parent' });
    expect(last?.edges).toContainEqual({ from: 'M', to: 'P', kind: 'parent' });
  });

  it('skips people the source reports as unavailable', async () => {
    const people = [person('R', [ref('F', 'male'), ref('M', 'female')]), person('M')];
    const last = (await collect(buildAncestorTree('R', sourceOf(people), { generations: 'all' }))).at(-1);
    expect(last?.nodes.map((node) => node.id)).toEqual(['R', 'M']);
  });

  it('yields nothing when it is aborted before it starts (TC-44)', async () => {
    const controller = new AbortController();
    controller.abort();
    const trees = await collect(
      buildAncestorTree('R', sourceOf(family), { generations: 'all' }, controller.signal),
    );
    expect(trees).toEqual([]);
  });
});

describe('assignParentSlots', () => {
  it('uses the gender for a single known parent and partner order otherwise', () => {
    const mother: Couple = { partner1: ref('M', 'female'), children: [], preferred: true };
    const unknown: Couple = { partner1: ref('X'), children: [], preferred: true };
    expect(assignParentSlots(mother, 3).map((entry) => entry.slot)).toEqual([7]);
    expect(assignParentSlots(unknown, 3).map((entry) => entry.slot)).toEqual([6]);
    expect(assignParentSlots({ children: [], preferred: true }, 3)).toEqual([]);
  });
});
