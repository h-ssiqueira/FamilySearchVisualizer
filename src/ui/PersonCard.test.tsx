import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Person, PersonRef } from '@/domain';
import { PersonCard } from './PersonCard';

const PLACE = 'São Paulo, São Paulo, Brazil';

const john: Person = {
  id: 'XXXX-XXX',
  name: 'John Example',
  gender: 'male',
  living: false,
  ageAtDeath: 99,
  birth: { date: { text: '+1800-12-31', source: 'formal' }, place: { text: PLACE } },
  death: { date: { text: '+1900-01-01', source: 'formal' }, place: { text: PLACE } },
  parentSets: [],
  unions: [],
};

const light = (gender: PersonRef['gender']): PersonRef => ({
  id: 'CCCC-CCC',
  name: 'Relative Example',
  gender,
  living: false,
});

describe('PersonCard', () => {
  it('renders the four lines of the sketch (TC-61)', () => {
    render(<PersonCard person={john} />);
    const card = screen.getByRole('article', { name: 'John Example' });
    expect(card).toHaveClass('person-card', 'person-card--male');
    expect(screen.getByTitle('John Example')).toHaveTextContent('John Example');
    expect(screen.getByText('1800-12-31 - 1900-01-01 (99)')).toBeInTheDocument();
    expect(screen.getByText(`${PLACE} - ${PLACE}`)).toBeInTheDocument();
    expect(screen.getByText('XXXX-XXX')).toBeInTheDocument();
  });

  it('keeps the full text in the tooltip when a place is long (TC-63)', () => {
    const longPlace = 'A very long place name, in a very long region, in a very long country, far away';
    const living: Person = {
      ...john,
      living: true,
      birth: { place: { text: longPlace } },
      death: undefined,
    };
    render(<PersonCard person={living} />);
    expect(screen.getByTitle(longPlace)).toHaveTextContent(longPlace);
  });

  it('shows the gender by a symbol with an accessible name, not by colour alone (TC-64)', () => {
    render(
      <>
        <PersonCard person={light('male')} />
        <PersonCard person={light('female')} />
        <PersonCard person={light('unknown')} />
      </>,
    );
    expect(screen.getByRole('img', { name: 'Male' })).toHaveTextContent('♂');
    expect(screen.getByRole('img', { name: 'Female' })).toHaveTextContent('♀');
    expect(screen.getByRole('img', { name: 'Unknown gender' })).toHaveTextContent('?');
  });

  it('shows name and id only for a light person, without placeholder text', () => {
    render(<PersonCard person={light('female')} />);
    expect(screen.getByTitle('Relative Example')).toBeInTheDocument();
    expect(screen.getByText('CCCC-CCC')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('undefined');
  });
});
