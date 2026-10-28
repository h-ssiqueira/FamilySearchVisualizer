import type { Couple, LifeEvent, Person, PersonId, PersonRef, ViewLevel } from './types';

/**
 * `line`: the root and its direct ancestors. `sibling`: other children of a couple on the line.
 * `spouse`: attached to a person on the right. `child`: a child of a union below.
 */
export type CardRole = 'line' | 'sibling' | 'spouse' | 'child';

export interface FamilyCard {
  id: PersonId;
  person: Person | PersonRef;
  role: CardRole;
  /** Generation: the root is 0, ancestors are above (positive), descendants below (negative). */
  row: number;
  /** Binary pedigree position of a line card (see TreeNode.slot). */
  slot?: number;
}

export interface FamilyCouple {
  id: string;
  /** `parents`: the parents of someone on the line. `union`: a person and their spouse(s). */
  kind: 'parents' | 'union';
  /** Left to right. One partner for a single parent, two otherwise. */
  partnerIds: PersonId[];
  event?: LifeEvent;
  childIds: PersonId[];
}

/** What the screen shows for one view level: cards and the couples that join them. */
export interface FamilyView {
  view: ViewLevel;
  rootId: PersonId;
  cards: FamilyCard[];
  couples: FamilyCouple[];
}
