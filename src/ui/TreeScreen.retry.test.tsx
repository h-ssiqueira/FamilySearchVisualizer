import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UnavailableError, type FamilySearchClient } from '@/api';
import type { CurrentUser, Gender, Person, PersonRef } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import type { Services } from '@/services';
import { PersonCache, createPersonSource } from '@/state';
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

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('failed people and retry (FR-33, TC-46)', () => {
  it('shows the people not loaded and retries only them, the rest comes from the cache', async () => {
    const people = new Map<string, Person>([
      [
        'R',
        {
          ...bare('R'),
          gender: 'male',
          parentSets: [
            {
              partner1: ref('F', 'male'),
              partner2: ref('M', 'female'),
              children: [ref('R', 'male')],
              preferred: true,
            },
          ],
        },
      ],
      ['F', bare('F')],
      ['M', bare('M')],
    ]);
    const calls = new Map<string, number>();
    let failFirstTimeForF = true;
    const client: FamilySearchClient = {
      getCurrentUser: async (): Promise<CurrentUser> => ({
        personId: 'R',
        displayName: 'R Example',
        gender: 'male',
      }),
      getPersonDetails: async (id: string): Promise<Person> => {
        calls.set(id, (calls.get(id) ?? 0) + 1);
        if (id === 'F' && failFirstTimeForF) {
          failFirstTimeForF = false;
          throw new Error('transient');
        }
        const found = people.get(id);
        if (!found) throw new UnavailableError(404);
        return found;
      },
    };
    const services: Services = { client, source: createPersonSource(client, new PersonCache()) };

    render(<TreeScreen services={services} onSignOut={vi.fn()} onExpired={vi.fn()} />);
    const retry = await screen.findByRole('button', { name: 'Retry failed' });
    expect(screen.getByRole('status')).toHaveTextContent('1 people could not be loaded');

    fireEvent.click(retry);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry failed' })).toBeNull());

    expect(calls.get('F')).toBe(2);
    expect(calls.get('R')).toBe(1);
    expect(calls.get('M')).toBe(1);
  });
});
