import { describe, expect, it } from 'vitest';
import { cardLines } from './cardText';
import type { Person, PersonRef } from './types';

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

describe('cardLines', () => {
  it('renders the four lines of the sketch for a deceased person (TC-61)', () => {
    expect(cardLines(john)).toEqual({
      name: 'John Example',
      dates: '1800-12-31 - 1900-01-01 (99)',
      places: `${PLACE} - ${PLACE}`,
      id: 'XXXX-XXX',
    });
  });

  it('shows only the birth date, no death part and no age for a living person (TC-71)', () => {
    const living: Person = { ...john, living: true, death: undefined, ageAtDeath: undefined };
    expect(cardLines(living)).toEqual({
      name: 'John Example',
      dates: '1800-12-31',
      places: PLACE,
      id: 'XXXX-XXX',
    });
  });

  it('keeps empty lines empty instead of inventing text', () => {
    const sparse: Person = { ...john, birth: undefined, death: undefined, ageAtDeath: 99 };
    expect(cardLines(sparse)).toEqual({
      name: 'John Example',
      dates: '',
      places: '',
      id: 'XXXX-XXX',
    });
  });

  it('shows a single known date without a dangling dash', () => {
    const onlyDeath: Person = { ...john, birth: undefined, ageAtDeath: undefined };
    expect(cardLines(onlyDeath).dates).toBe('1900-01-01');
  });

  it('shows only name and id for a light person', () => {
    const ref: PersonRef = { id: 'CCCC-CCC', name: 'Sibling Example', gender: 'female', living: false };
    expect(cardLines(ref)).toEqual({
      name: 'Sibling Example',
      dates: '',
      places: '',
      id: 'CCCC-CCC',
    });
  });
});
