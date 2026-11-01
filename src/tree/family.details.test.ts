import { describe, expect, it } from 'vitest';
import { InvalidDataError, SessionExpiredError, type Person, type PersonRef, type PersonSource, type ViewTree } from '@/domain';
import { buildFamilyView, withDetails } from './family';

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

const root: Person = {
  ...bare('R'),
  gender: 'male',
  parentSets: [
    {
      partner1: ref('F', 'male'),
      partner2: ref('M', 'female'),
      children: [ref('R', 'male'), ref('SIB', 'female')],
      preferred: true,
    },
  ],
};

const treeOf = (person: Person): ViewTree => ({
  view: 'V1',
  root: 'R',
  nodes: [
    { id: 'R', person, generation: 0, slot: 0, role: 'root' },
    { id: 'F', person: ref('F', 'male'), generation: 1, slot: 0, role: 'ancestor' },
    { id: 'M', person: ref('M', 'female'), generation: 1, slot: 1, role: 'ancestor' },
  ],
  edges: [],
  pending: [],
  failed: [],
});

const v2 = (): ReturnType<typeof buildFamilyView> => buildFamilyView(treeOf(root), 'V2');

/** Records what was asked for, and answers with the given behaviour per id. */
function recordingSource(behaviour: (id: string) => Promise<Person | null>) {
  const requested: string[] = [];
  const source: PersonSource = {
    getPerson: async (id) => {
      requested.push(id);
      return behaviour(id);
    },
  };
  return { source, requested };
}

describe('relatives get their details in V2 (OQ-05)', () => {
  it('replaces the light relatives with their full details', async () => {
    const full = (id: string): Person => ({ ...bare(id), birth: { date: { text: '+1900-01-01', source: 'formal' } } });
    const { source, requested } = recordingSource(async (id) => full(id));

    const view = await withDetails(v2(), source);

    const sibling = view.cards.find((card) => card.id === 'SIB');
    expect(sibling?.person).toMatchObject({ parentSets: [] });
    expect('birth' in (sibling?.person ?? {})).toBe(true);
    expect(requested).toEqual(expect.arrayContaining(['SIB']));
  });

  it('does not request the people already on the line', async () => {
    const { source, requested } = recordingSource(async () => null);
    await withDetails(v2(), source);
    expect(requested).not.toContain('R');
    expect(requested).not.toContain('F');
    expect(requested).not.toContain('M');
  });

  it('keeps the light card of a relative that cannot be loaded (FR-33)', async () => {
    const { source } = recordingSource(async () => {
      throw new Error('transient');
    });
    const view = await withDetails(v2(), source);
    const sibling = view.cards.find((card) => card.id === 'SIB');
    expect(sibling).toBeDefined();
    expect('parentSets' in (sibling?.person ?? {})).toBe(false);
  });

  it('stops the whole load when the session has expired', async () => {
    const { source } = recordingSource(async () => {
      throw new SessionExpiredError();
    });
    await expect(withDetails(v2(), source)).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it('does not request the relatives again when they are unexpected (TC-15 relatives)', async () => {
    const { source, requested } = recordingSource(async (id) => {
      if (id === 'SIB') throw new InvalidDataError('unexpected');
      return null;
    });
    const view = await withDetails(v2(), source);
    expect(requested.filter((id) => id === 'SIB')).toHaveLength(1);
    expect(view.cards.find((card) => card.id === 'SIB')).toBeDefined();
  });
});
