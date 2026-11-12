import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Couple, Person, PersonRef, PersonSource } from '@/domain';
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

const root: Person = {
  ...bare('R'),
  parentSets: [
    {
      partner1: ref('F', 'male'),
      partner2: ref('M', 'female'),
      children: [],
      preferred: true,
    } as Couple,
  ],
};

const people = new Map<string, Person>([
  ['R', root],
  ['M', bare('M')],
]);

async function build(source: PersonSource): Promise<void> {
  for await (const _tree of buildAncestorTree('R', source, { generations: 'all' })) {
    // Only the side effects matter here: the console lines.
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('console report of people that cannot be loaded (FR-39)', () => {
  it('writes the id, the name and the reason of a person whose load failed', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const source: PersonSource = {
      getPerson: async (id) => {
        if (id === 'F') throw new Error('transient');
        return people.get(id) ?? null;
      },
    };

    await build(source);

    const lines = warn.mock.calls.map((call) => String(call[0]));
    expect(lines.some((line) => line.includes('F') && line.includes('F Example') && line.includes('Error: transient'))).toBe(true);
  });

  it('writes the reason "no data" for a parent that is restricted or missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const source: PersonSource = { getPerson: async (id) => people.get(id) ?? null };

    await build(source);

    const lines = warn.mock.calls.map((call) => String(call[0]));
    expect(lines.some((line) => line.includes('F Example') && line.includes('no data'))).toBe(true);
  });

  it('writes nothing for a person that loads correctly', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const source: PersonSource = {
      getPerson: async (id) => ({ ...(people.get(id) ?? bare(id)), parentSets: [] }),
    };

    await build(source);

    expect(warn).not.toHaveBeenCalled();
  });
});
