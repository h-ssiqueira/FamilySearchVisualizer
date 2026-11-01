import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Person, PersonRef } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import { PersonPanel } from './PersonPanel';

const light: PersonRef = { id: 'AAAA-AAA', name: 'Light Example', gender: 'female', living: false };

const full: Person = {
  id: 'AAAA-AAA',
  name: 'Light Example',
  gender: 'female',
  living: false,
  ageAtDeath: 80,
  birth: { date: { text: '+1900-01-01', source: 'formal' }, place: { text: 'Lisbon, Portugal' } },
  death: { date: { text: '+1980-02-03', source: 'formal' }, place: { text: 'Porto, Portugal' } },
  parentSets: [],
  unions: [
    {
      partner1: { id: 'BBBB-BBB', name: 'Spouse Example', gender: 'male', living: false },
      partner2: { id: 'AAAA-AAA', name: 'Light Example', gender: 'female', living: false },
      event: {
        date: { text: '+1925-05-20', source: 'formal' },
        place: { text: 'Campinas, Brazil' },
      },
      children: [],
      preferred: true,
    },
  ],
};

afterEach(() => {
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

describe('PersonPanel', () => {
  it('loads the full details of a light person and shows them untruncated (FR-18)', async () => {
    const getPerson = vi.fn(async () => full);
    render(<PersonPanel person={light} source={{ getPerson }} onClose={vi.fn()} />);

    expect(await screen.findByText('1900-01-01 - 1980-02-03 (80)')).toBeInTheDocument();
    expect(screen.getByText('Lisbon, Portugal - Porto, Portugal')).toBeInTheDocument();
    expect(screen.getByText('AAAA-AAA')).toBeInTheDocument();
    expect(screen.getByText('Spouse Example · 1925-05-20 · Campinas, Brazil')).toBeInTheDocument();
    expect(getPerson).toHaveBeenCalledTimes(1);
  });

  it('links to the person page on familysearch.org (FR-16)', () => {
    render(<PersonPanel person={full} source={{ getPerson: vi.fn() }} onClose={vi.fn()} />);
    const link = screen.getByRole('link', { name: 'Open on FamilySearch' });
    expect(link).toHaveAttribute(
      'href',
      'https://www.familysearch.org/tree/person/details/AAAA-AAA',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('does not request anything for a person that is already complete', () => {
    const getPerson = vi.fn();
    render(<PersonPanel person={full} source={{ getPerson }} onClose={vi.fn()} />);
    expect(getPerson).not.toHaveBeenCalled();
    expect(screen.getByText('1900-01-01 - 1980-02-03 (80)')).toBeInTheDocument();
  });

  it('says so when the details are not available, and still offers the link', async () => {
    render(<PersonPanel person={light} source={{ getPerson: async () => null }} onClose={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('not available');
    expect(screen.getByRole('link', { name: 'Open on FamilySearch' })).toBeInTheDocument();
  });

  it('closes', () => {
    const onClose = vi.fn();
    render(<PersonPanel person={full} source={{ getPerson: vi.fn() }} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
