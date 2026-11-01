export type PersonId = string;
export type Gender = 'male' | 'female' | 'unknown';
export type ViewLevel = 'V1' | 'V2' | 'V3';

/** A date as text: genealogical dates can be partial, approximate or ranges. */
export interface DateText {
  text: string;
  source: 'formal' | 'normalized';
}

export interface Place {
  id?: string;
  text: string;
}

export interface LifeEvent {
  date?: DateText;
  place?: Place;
}

/** "Light" person: what another person's response says about a relative. */
export interface PersonRef {
  id: PersonId;
  name: string;
  gender: Gender;
  living: boolean;
}

export interface Couple {
  partner1?: PersonRef;
  partner2?: PersonRef;
  event?: LifeEvent;
  children: PersonRef[];
  preferred: boolean;
}

/** "Full" person: loaded from its own details endpoint. */
export interface Person {
  id: PersonId;
  name: string;
  gender: Gender;
  living: boolean;
  birth?: LifeEvent;
  death?: LifeEvent;
  ageAtDeath?: number;
  parentSets: Couple[];
  unions: Couple[];
}

export interface CurrentUser {
  personId: PersonId;
  displayName: string;
  gender: Gender;
  birthDate?: string;
  preferredLanguage?: string;
}

export interface TreeNode {
  id: PersonId;
  person: Person | PersonRef;
  generation: number;
  /** Binary position inside the generation: father = 2n, mother = 2n + 1. */
  slot: number;
  role: 'root' | 'ancestor';
}

export interface TreeEdge {
  from: PersonId;
  to: PersonId;
  kind: 'parent';
}

export interface ViewTree {
  view: ViewLevel;
  root: PersonId;
  nodes: TreeNode[];
  edges: TreeEdge[];
  pending: PersonId[];
}
