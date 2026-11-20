import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Couple, CurrentUser, Gender, Person, PersonRef } from '@/domain';
import type { Services } from '@/services';
import { TreeScreen } from './TreeScreen';

const ref = (id: string, gender: Gender = 'unknown'): PersonRef => ({
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

const withParents = (id: string, father: PersonRef, mother: PersonRef): Person => ({
  ...bare(id),
  parentSets: [{ partner1: father, partner2: mother, children: [], preferred: true } as Couple],
});

/**
 * Pedigree collapse: P is the father of F and the father of M, so P is reached twice (TC-22).
 * The tree page must show P once, with the repeat symbol on its card.
 */
const people = new Map<string, Person>([
  ['R', withParents('R', ref('F', 'male'), ref('M', 'female'))],
  ['F', withParents('F', ref('P', 'male'), ref('Q1', 'female'))],
  ['M', withParents('M', ref('P', 'male'), ref('Q2', 'female'))],
  ['P', bare('P')],
  ['Q1', bare('Q1')],
  ['Q2', bare('Q2')],
]);

const services: Services = {
  client: {
    getCurrentUser: async (): Promise<CurrentUser> => ({
      personId: 'R',
      displayName: 'R Example',
      gender: 'male',
    }),
    getPersonDetails: () => Promise.reject(new Error('not used')),
  },
  source: { getPerson: async (id) => people.get(id) ?? null },
};

describe('repeated ancestor on the tree page (TC-22)', () => {
  it('draws the repeated ancestor once, with the repeat symbol on its card', async () => {
    render(<TreeScreen services={services} onSignOut={vi.fn()} onExpired={vi.fn()} />);

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(6));
    expect(screen.getAllByTitle('P Example')).toHaveLength(1);
    expect(screen.getAllByRole('img', { name: 'Appears again in this tree' })).toHaveLength(1);
  });
});
