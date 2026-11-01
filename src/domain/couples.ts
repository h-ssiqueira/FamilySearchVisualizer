import type { Couple, PersonId, PersonRef } from './types';

/** The partner of `personId` in a couple: the one whose id differs (API findings, section 3). */
export function partnerOf(personId: PersonId, couple: Couple): PersonRef | undefined {
  return [couple.partner1, couple.partner2].find(
    (partner): partner is PersonRef => partner !== undefined && partner.id !== personId,
  );
}

/** Children of a couple other than `personId` (the person appears in their own parents' list). */
export function siblingsIn(personId: PersonId, couple: Couple): PersonRef[] {
  return couple.children.filter((child) => child.id !== personId);
}

/** The preferred family, otherwise the first one. */
export function preferredCouple(couples: Couple[]): Couple | undefined {
  return couples.find((couple) => couple.preferred) ?? couples[0];
}
