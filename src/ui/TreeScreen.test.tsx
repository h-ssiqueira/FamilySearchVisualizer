import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@/api';
import type { CurrentUser, Gender, Person, PersonRef } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import type { Services } from '@/services';
import { viewStore } from '@/state/viewStore';
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
          children: [ref('R', 'male'), ref('SIB', 'female')],
          preferred: true,
        },
      ],
      unions: [
        {
          partner1: ref('S', 'female'),
          partner2: ref('R', 'male'),
          children: [ref('K', 'male')],
          preferred: true,
        },
      ],
    }),
  ],
  ['F', person('F', { gender: 'male' })],
  ['M', person('M', { gender: 'female' })],
]);

const defaultUser = async (): Promise<CurrentUser> => ({
  personId: 'R',
  displayName: 'R Example',
  gender: 'male',
});

function fakeServices(user: () => Promise<CurrentUser> = defaultUser) {
  const requested: string[] = [];
  const services: Services = {
    client: {
      getCurrentUser: user,
      getPersonDetails: () => Promise.reject(new Error('not used')),
    },
    source: {
      getPerson: async (id) => {
        requested.push(id);
        return people.get(id) ?? null;
      },
    },
  };
  return { services, requested };
}

afterEach(() => {
  window.localStorage.clear();
  // The chosen view is kept in memory, so each test starts from the direct line again.
  viewStore.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('TreeScreen', () => {
  it('starts from the current user and shows the direct line (TC-20)', async () => {
    const { services } = fakeServices();
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));
    expect(screen.getByTitle('R Example')).toBeInTheDocument();
    expect(screen.getByTitle('F Example')).toBeInTheDocument();
    expect(screen.getByTitle('M Example')).toBeInTheDocument();
  });

  it('adds siblings, the spouse and the children of the root in V2, and loads their details (OQ-05)', async () => {
    const { services, requested } = fakeServices();
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    fireEvent.click(screen.getByRole('button', { name: 'Couples and children' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(6));
    await waitFor(() => expect(requested).toEqual(expect.arrayContaining(['SIB', 'S', 'K'])));
  });

  it('loads the relatives of the children in V3 (TC-26) and goes back to V1 (TC-27)', async () => {
    const { services, requested } = fakeServices();
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    fireEvent.click(screen.getByRole('button', { name: 'Extended family' }));
    await waitFor(() => expect(requested).toEqual(expect.arrayContaining(['SIB', 'K'])));

    fireEvent.click(screen.getByRole('button', { name: 'Direct line' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));
  });

  it('uses the FamilySearch language preference when the user has not chosen one', async () => {
    const { services } = fakeServices(async () => ({
      personId: 'R',
      displayName: 'R Example',
      gender: 'male',
      preferredLanguage: 'pt',
    }));
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    expect(
      await screen.findByRole('heading', { name: 'Sua árvore genealógica' }),
    ).toBeInTheDocument();
  });

  it('signs out when FamilySearch rejects the token (FR-04, TC-07)', async () => {
    const onSignOut = vi.fn();
    const { services } = fakeServices(() => Promise.reject(new UnauthorizedError()));
    render(<TreeScreen services={services} onSignOut={onSignOut} />);
    await waitFor(() => expect(onSignOut).toHaveBeenCalled());
  });

  it('shows a recoverable error for any other failure (FR-20)', async () => {
    const { services } = fakeServices(() => Promise.reject(new Error('network')));
    render(<TreeScreen services={services} onSignOut={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
