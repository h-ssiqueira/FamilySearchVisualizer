import { formatDate } from './dates';
import type { Person, PersonRef } from './types';

export interface CardLines {
  name: string;
  dates: string;
  places: string;
  id: string;
}

function isFullPerson(person: Person | PersonRef): person is Person {
  return 'parentSets' in person;
}

/**
 * The four lines of a person card (SDD UI spec): name; birth - death (age); places; id.
 * Living people show only the birth date. Light persons carry no dates or places.
 */
export function cardLines(person: Person | PersonRef): CardLines {
  if (!isFullPerson(person)) {
    return { name: person.name, dates: '', places: '', id: person.id };
  }

  const birth = formatDate(person.birth?.date);
  const death = formatDate(person.death?.date);
  const birthPlace = person.birth?.place?.text ?? '';
  const deathPlace = person.death?.place?.text ?? '';

  if (person.living) {
    return { name: person.name, dates: birth, places: birthPlace, id: person.id };
  }

  const span = [birth, death].filter((part) => part !== '').join(' - ');
  const age = person.ageAtDeath === undefined ? '' : ` (${person.ageAtDeath})`;
  return {
    name: person.name,
    dates: span === '' ? '' : `${span}${age}`,
    places: [birthPlace, deathPlace].filter((part) => part !== '').join(' - '),
    id: person.id,
  };
}
