import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUser, Gender, Person, PersonRef } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import type { Services } from '@/services';
import { TreeScreen } from './TreeScreen';

const ref = (id: string, gender: Gender = 'unknown'): PersonRef => ({
  id,
  name: `${id} Example`,
  gender,
  living: false,
});

function person(id: string, overrides: Partial<Person> = {}): Person {
  return {
    id,
    name: `${id} Example`,
    gender: 'unknown',
    living: false,
    parentSets: [],
    unions: [],
    ...overrides,
  };
}

const people = new Map<string, Person>([
  [
    'R',
    person('R', {
      gender: 'male',
      parentSets: [
        {
          partner1: ref('F', 'male'),
          partner2: ref('M', 'female'),
          children: [ref('R', 'male')],
          preferred: true,
        },
      ],
    }),
  ],
  ['F', person('F', { gender: 'male' })],
  ['M', person('M', { gender: 'female' })],
]);

const user = async (): Promise<CurrentUser> => ({
  personId: 'R',
  displayName: 'R Example',
  gender: 'male',
});

const services: Services = {
  client: { getCurrentUser: user, getPersonDetails: () => Promise.reject(new Error('not used')) },
  source: { getPerson: async (id) => people.get(id) ?? null },
};

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('TreeScreen card selection (FR-16, FR-18)', () => {
  it('opens a panel with the link to the person page and toggles it', async () => {
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    fireEvent.click(screen.getByRole('button', { name: 'Show R Example' }));
    const panel = await screen.findByRole('complementary', { name: 'Details of R Example' });
    expect(panel).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open on FamilySearch' })).toHaveAttribute(
      'href',
      'https://www.familysearch.org/tree/person/details/R',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show R Example' }));
    await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull());
  });

  it('changes the panel when another card is selected and closes it with the button', async () => {
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    fireEvent.click(screen.getByRole('button', { name: 'Show F Example' }));
    expect(
      await screen.findByRole('complementary', { name: 'Details of F Example' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show M Example' }));
    expect(
      await screen.findByRole('complementary', { name: 'Details of M Example' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull());
  });
});
