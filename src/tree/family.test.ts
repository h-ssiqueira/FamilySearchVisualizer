import { describe, expect, it } from 'vitest';
import type {
  Couple,
  Gender,
  LifeEvent,
  Person,
  PersonRef,
  PersonSource,
  ViewTree,
} from '@/domain';
import { buildAncestorTree } from './ancestors';
import { buildFamilyView, extendToV3, hasMoreAncestors } from './family';

const ref = (id: string, gender: Gender = 'unknown'): PersonRef => ({
  id,
  name: id,
  gender,
  living: false,
});

function couple(
  partner1: PersonRef | undefined,
  partner2: PersonRef | undefined,
  children: PersonRef[],
  event?: LifeEvent,
): Couple {
  const result: Couple = { children, preferred: true };
  if (partner1) result.partner1 = partner1;
  if (partner2) result.partner2 = partner2;
  if (event) result.event = event;
  return result;
}

const person = (id: string, parentSets: Couple[] = [], unions: Couple[] = []): Person => ({
  id,
  name: id,
  gender: 'unknown',
  living: false,
  parentSets,
  unions,
});

const MARRIAGE: LifeEvent = { date: { text: '+1825-05-20', source: 'formal' } };

const people: Person[] = [
  person(
    'R',
    [couple(ref('F', 'male'), ref('M', 'female'), [ref('R'), ref('SIB')], MARRIAGE)],
    [couple(ref('S', 'female'), ref('R'), [ref('K')])],
  ),
  person('F'),
  person('M'),
  person('SIB', [], [couple(ref('Z'), ref('SIB'), [ref('N')])]),
  person('K', [], [couple(ref('Y'), ref('K'), [ref('G')])]),
];

function sourceOf(list: Person[]): PersonSource {
  const byId = new Map(list.map((entry) => [entry.id, entry] as const));
  return { getPerson: async (id) => byId.get(id) ?? null };
}

async function treeFor(list: Person[], generations: number | 'all'): Promise<ViewTree> {
  let last: ViewTree | undefined;
  for await (const tree of buildAncestorTree('R', sourceOf(list), { generations })) last = tree;
  if (!last) throw new Error('no tree was built');
  return last;
}

describe('buildFamilyView', () => {
  it('V1 shows only the line and the couples that join it', async () => {
    const view = buildFamilyView(await treeFor(people, 'all'), 'V1');
    expect(view.view).toBe('V1');
    expect(view.cards.map((card) => card.id)).toEqual(['R', 'F', 'M']);
    expect(view.cards.every((card) => card.role === 'line')).toBe(true);
    expect(view.couples).toHaveLength(1);
    expect(view.couples[0]).toMatchObject({
      id: 'p:F+M',
      kind: 'parents',
      partnerIds: ['F', 'M'],
      childIds: ['R'],
      event: MARRIAGE,
    });
  });

  it('V2 adds the siblings, and the spouse and children of the root (TC-23, TC-24)', async () => {
    const view = buildFamilyView(await treeFor(people, 'all'), 'V2');
    const role = (id: string) => view.cards.find((card) => card.id === id);
    expect(role('SIB')).toMatchObject({ role: 'sibling', row: 0 });
    expect(role('S')).toMatchObject({ role: 'spouse', row: 0 });
    expect(role('K')).toMatchObject({ role: 'child', row: -1 });

    const parents = view.couples.find((entry) => entry.id === 'p:F+M');
    expect(parents?.childIds).toEqual(['R', 'SIB']);
    const union = view.couples.find((entry) => entry.id === 'u:R+S');
    expect(union).toMatchObject({ kind: 'union', partnerIds: ['R', 'S'], childIds: ['K'] });
  });

  it('puts the man first whichever order the API gives the parents', async () => {
    const swapped = [
      person('R', [couple(ref('M', 'female'), ref('F', 'male'), [ref('R')])]),
      person('F'),
      person('M'),
    ];
    const view = buildFamilyView(await treeFor(swapped, 'all'), 'V1');
    expect(view.couples[0]?.partnerIds).toEqual(['F', 'M']);
  });

  it('keeps a union with children but without spouse, and skips an empty union', async () => {
    const list = [
      person('R', [], [couple(undefined, ref('R'), [ref('K')]), couple(ref('X'), ref('R'), [])]),
    ];
    const view = buildFamilyView(await treeFor(list, 'all'), 'V2');
    expect(view.couples.map((entry) => entry.id)).toEqual(['u:R', 'u:R+X']);
    expect(view.cards.map((card) => card.id)).toEqual(['R', 'K', 'X']);
    expect(view.couples[0]?.partnerIds).toEqual(['R']);
  });

  it('has no couple when the parents are not loaded', async () => {
    const view = buildFamilyView(await treeFor(people, 0), 'V2');
    expect(view.couples.find((entry) => entry.kind === 'parents')).toBeUndefined();
    expect(view.cards.find((card) => card.id === 'SIB')).toBeUndefined();
  });
});

describe('extendToV3', () => {
  it('adds the spouses of the children and their children, one level only (TC-25, TC-26)', async () => {
    const v2 = buildFamilyView(await treeFor(people, 'all'), 'V2');
    const requested: string[] = [];
    const source: PersonSource = {
      getPerson: async (id) => {
        requested.push(id);
        return people.find((entry) => entry.id === id) ?? null;
      },
    };

    const v3 = await extendToV3(v2, source);

    expect(v3.view).toBe('V3');
    expect(requested.sort()).toEqual(['K', 'SIB']);
    const card = (id: string) => v3.cards.find((entry) => entry.id === id);
    expect(card('Z')).toMatchObject({ role: 'spouse', row: 0 });
    expect(card('N')).toMatchObject({ role: 'child', row: -1 });
    expect(card('Y')).toMatchObject({ role: 'spouse', row: -1 });
    expect(card('G')).toMatchObject({ role: 'child', row: -2 });
    expect(card('SIB') && 'parentSets' in (card('SIB')?.person ?? {})).toBe(true);
    expect(v3.couples.find((entry) => entry.id === 'u:SIB+Z')?.childIds).toEqual(['N']);
    expect(v3.couples.find((entry) => entry.id === 'u:K+Y')?.childIds).toEqual(['G']);
    // One level only: the new children are not expanded.
    expect(requested).not.toContain('N');
    expect(requested).not.toContain('G');
  });

  it('skips people the source reports as unavailable', async () => {
    const v2 = buildFamilyView(await treeFor(people, 'all'), 'V2');
    const v3 = await extendToV3(v2, { getPerson: async () => null });
    expect(v3.cards.map((card) => card.id).sort()).toEqual(v2.cards.map((card) => card.id).sort());
  });

  it('returns the view unchanged when it is aborted', async () => {
    const v2 = buildFamilyView(await treeFor(people, 'all'), 'V2');
    const controller = new AbortController();
    controller.abort();
    const result = await extendToV3(v2, sourceOf(people), controller.signal);
    expect(result).toBe(v2);
  });
});

describe('hasMoreAncestors', () => {
  it('is true while the deepest generation still has known parents', async () => {
    expect(hasMoreAncestors(await treeFor(people, 0))).toBe(true);
  });

  it('is false when the line has ended', async () => {
    expect(hasMoreAncestors(await treeFor(people, 'all'))).toBe(false);
  });
});
