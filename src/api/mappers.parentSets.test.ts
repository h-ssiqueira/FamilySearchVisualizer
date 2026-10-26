import { describe, expect, it } from 'vitest';
import { parsePerson } from './mappers';

describe('parent sets and spouses (TC-13)', () => {
  it('keeps every parent set, with the preferred flag', () => {
    const person = parsePerson({
      id: 'XXXX-XXX',
      name: 'John Example',
      gender: 'MALE',
      parents: [
        {
          preferred: false,
          parent1: { id: 'AAAA-AAA', name: 'A Example', gender: 'MALE' },
          children: [{ child: { id: 'XXXX-XXX', name: 'John Example', gender: 'MALE' } }],
        },
        {
          preferred: true,
          parent1: { id: 'BBBB-BBB', name: 'B Example', gender: 'MALE' },
          children: [{ child: { id: 'XXXX-XXX', name: 'John Example', gender: 'MALE' } }],
        },
      ],
    });

    expect(person.parentSets.map((set) => set.partner1?.id)).toEqual(['AAAA-AAA', 'BBBB-BBB']);
    expect(person.parentSets.map((set) => set.preferred)).toEqual([false, true]);
  });

  it('keeps every spouse of a person', () => {
    const person = parsePerson({
      id: 'XXXX-XXX',
      name: 'John Example',
      gender: 'MALE',
      spouses: [
        { preferred: true, parent1: { id: 'CCCC-CCC', name: 'C Example', gender: 'FEMALE' } },
        { preferred: false, parent1: { id: 'DDDD-DDD', name: 'D Example', gender: 'FEMALE' } },
      ],
    });

    expect(person.unions).toHaveLength(2);
    expect(person.unions.map((union) => union.preferred)).toEqual([true, false]);
  });
});
