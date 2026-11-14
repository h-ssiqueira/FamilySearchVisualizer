import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUser, Gender, Person, PersonRef } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import type { Services } from '@/services';
import { GraphScreen } from './GraphScreen';

/** The library needs a real canvas, which jsdom does not have: its chainable methods are stubbed. */
vi.mock('force-graph', () => {
  class FakeForceGraph {
    width(): this {
      return this;
    }
    height(): this {
      return this;
    }
    nodeCanvasObjectMode(): this {
      return this;
    }
    nodeCanvasObject(): this {
      return this;
    }
    linkColor(): this {
      return this;
    }
    linkLineDash(): this {
      return this;
    }
    onNodeClick(): this {
      return this;
    }
    graphData(): this {
      return this;
    }
    _destructor(): void {}
  }
  return { default: FakeForceGraph };
});

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

function fakeServices(): Services {
  return {
    client: {
      getCurrentUser: user,
      getPersonDetails: () => Promise.reject(new Error('not used')),
    },
    source: { getPerson: async (id) => people.get(id) ?? null },
  };
}

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('GraphScreen (FR-40, FR-45)', () => {
  it('lists the same people as the tree, for keyboard and screen-reader use', async () => {
    render(<GraphScreen services={fakeServices()} onSignOut={vi.fn()} onExpired={vi.fn()} />);
    expect(await screen.findByRole('button', { name: 'R Example' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'F Example' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'M Example' })).toBeInTheDocument();
  });

  it('selects a person from the list and opens the details panel (FR-44)', async () => {
    render(<GraphScreen services={fakeServices()} onSignOut={vi.fn()} onExpired={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'F Example' }));
    expect(
      await screen.findByRole('complementary', { name: 'Details of F Example' }),
    ).toBeInTheDocument();
  });

  it('links back to the tree page', async () => {
    render(<GraphScreen services={fakeServices()} onSignOut={vi.fn()} onExpired={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Tree view' })).toHaveAttribute('href', '#/'));
  });
});
