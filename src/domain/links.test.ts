import { describe, expect, it } from 'vitest';
import { personPageUrl } from './links';

describe('personPageUrl (FR-16)', () => {
  it('points to the person page on familysearch.org', () => {
    expect(personPageUrl('XXXX-XXX')).toBe(
      'https://www.familysearch.org/tree/person/details/XXXX-XXX',
    );
  });

  it('encodes anything that is not part of an id', () => {
    expect(personPageUrl('a/b?c')).toBe(
      'https://www.familysearch.org/tree/person/details/a%2Fb%3Fc',
    );
  });
});
