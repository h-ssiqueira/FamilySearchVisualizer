import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUser, Couple, Person, PersonRef } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import type { Services } from '@/services';
import { TreeScreen } from './TreeScreen';

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

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

function servicesWith(
  people: Map<string, Person>,
  failOnce: string | undefined,
  calls: Map<string, number>,
): Services {
  let failed = false;
  return {
    client: {
      getCurrentUser: async (): Promise<CurrentUser> => ({
        personId: 'R',
        displayName: 'R Example',
        gender: 'male',
      }),
      getPersonDetails: () => Promise.reject(new Error('not used')),
    },
    source: {
      getPerson: async (id) => {
        calls.set(id, (calls.get(id) ?? 0) + 1);
        if (id === failOnce && !failed) {
          failed = true;
          throw new Error('transient');
        }
        return people.get(id) ?? null;
      },
    },
  };
}

describe('states of the tree (FR-20, FR-12)', () => {
  it('says that a person has no parents on record (empty state)', async () => {
    const people = new Map<string, Person>([['R', bare('R')]]);
    render(
      <TreeScreen
        services={servicesWith(people, undefined, new Map())}
        onSignOut={vi.fn()}
        onExpired={vi.fn()}
      />,
    );
    expect(await screen.findByText('No parents are recorded for this person.')).toBeInTheDocument();
  });

  it('names the failed person in its retry action when the name is known', async () => {
    const people = new Map<string, Person>([
      [
        'R',
        {
          ...bare('R'),
          gender: 'male',
          parentSets: [
            {
              partner1: ref('F', 'male'),
              partner2: undefined,
              children: [],
              preferred: true,
            } as Couple,
          ],
        },
      ],
      ['F', bare('F')],
    ]);
    const calls = new Map<string, number>();
    render(
      <TreeScreen
        services={servicesWith(people, 'F', calls)}
        onSignOut={vi.fn()}
        onExpired={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Try again: F Example (F)' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Try again: F Example (F)' })).toBeNull(),
    );
    expect(calls.get('F')).toBe(2);
    expect(calls.get('R')).toBe(2);
  });
});
