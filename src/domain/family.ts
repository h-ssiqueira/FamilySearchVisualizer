import type { Couple, LifeEvent, Person, PersonId, PersonRef, ViewLevel } from './types';

/**
 * `line`: the root and its direct ancestors. `sibling`: other children of a couple on the line.
 * `spouse`: attached to a person on the right. `child`: a child of a union below.
 */
export type CardRole = 'line' | 'sibling' | 'spouse' | 'child';

/** How many families a person has, and which one the card shows (1-based), OQ-25. */
export interface FamilyChoice {
  total: number;
  shown: number;
}

export interface FamilyCard {
  id: PersonId;
  person: Person | PersonRef;
  role: CardRole;
  /** Generation: the root is 0, ancestors are above (positive), descendants below (negative). */
  row: number;
  /** Binary pedigree position of a line card (see TreeNode.slot). */
  slot?: number;
  /** Set when the person has more than one family: the crossed-arrows button shows them (OQ-23, OQ-25). */
  families?: FamilyChoice;
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
