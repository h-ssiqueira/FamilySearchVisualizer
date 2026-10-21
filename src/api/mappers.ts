import { z } from 'zod';
import {
  makeDateText,
  toGender,
  type Couple,
  type CurrentUser,
  type LifeEvent,
  type Person,
  type PersonRef,
} from '@/domain';
import { SchemaError } from './errors';

// Whitelist (SDD API findings, section 7): zod objects drop every field not declared here,
// so tokens, e-mail, phone, PIN and contributor data can never reach the app.
const text = z.string().nullish();
const dateSchema = z
  .object({ formalText: text, normalizedText: text, localizedText: text })
  .nullish();
const placeSchema = z
  .object({ id: z.union([z.string(), z.number()]).nullish(), normalizedText: text, localizedText: text })
  .nullish();
const eventSchema = z
  .object({ details: z.object({ date: dateSchema, place: placeSchema }).nullish() })
  .nullish();
const personRefSchema = z.object({
  id: z.string(),
  name: text,
  gender: text,
  living: z.boolean().nullish(),
});
const coupleSchema = z.object({
  parent1: personRefSchema.nullish(),
  parent2: personRefSchema.nullish(),
  event: eventSchema,
  children: z.array(z.object({ child: personRefSchema })).nullish(),
  preferred: z.boolean().nullish(),
});
const personSchema = z.object({
  id: z.string(),
  name: text,
  gender: text,
  living: z.boolean().nullish(),
  ageAtDeath: z.union([z.number(), z.string()]).nullish(),
  birth: eventSchema,
  death: eventSchema,
  parents: z.array(coupleSchema).nullish(),
  spouses: z.array(coupleSchema).nullish(),
});
const currentUserSchema = z.object({
  users: z.array(
    z.object({
      personId: z.string(),
      displayName: text,
      gender: text,
      birthDate: text,
      preferredLanguage: text,
    }),
  ),
});

type RawPersonRef = z.infer<typeof personRefSchema>;
type RawEvent = z.infer<typeof eventSchema>;
type RawCouple = z.infer<typeof coupleSchema>;

function toRef(raw: RawPersonRef): PersonRef {
  return {
    id: raw.id,
    name: raw.name ?? '',
    gender: toGender(raw.gender),
    living: raw.living ?? false,
  };
}

function toEvent(raw: RawEvent): LifeEvent | undefined {
  const details = raw?.details;
  if (!details) return undefined;
  const event: LifeEvent = {};
  const date = makeDateText(details.date);
  if (date) event.date = date;
  const placeText = details.place?.normalizedText?.trim() || details.place?.localizedText?.trim();
  if (placeText) {
    const placeId = details.place?.id;
    event.place =
      placeId === undefined || placeId === null
        ? { text: placeText }
        : { id: String(placeId), text: placeText };
  }
  return event.date || event.place ? event : undefined;
}

function toCouple(raw: RawCouple): Couple {
  const couple: Couple = {
    children: (raw.children ?? []).map((entry) => toRef(entry.child)),
    preferred: raw.preferred ?? false,
  };
  if (raw.parent1) couple.partner1 = toRef(raw.parent1);
  if (raw.parent2) couple.partner2 = toRef(raw.parent2);
  const event = toEvent(raw.event);
  if (event) couple.event = event;
  return couple;
}

function toAge(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const age = typeof value === 'number' ? value : Number.parseInt(value, 10);
  return Number.isFinite(age) ? age : undefined;
}

export function parsePerson(json: unknown): Person {
  const result = personSchema.safeParse(json);
  if (!result.success) {
    throw new SchemaError(result.error.issues.map((issue) => issue.path.join('.')));
  }
  const raw = result.data;
  const person: Person = {
    id: raw.id,
    name: raw.name ?? '',
    gender: toGender(raw.gender),
    living: raw.living ?? false,
    parentSets: (raw.parents ?? []).map((couple) => toCouple(couple)),
    unions: (raw.spouses ?? []).map((couple) => toCouple(couple)),
  };
  const birth = toEvent(raw.birth);
  if (birth) person.birth = birth;
  const death = toEvent(raw.death);
  if (death) person.death = death;
  const age = toAge(raw.ageAtDeath);
  if (age !== undefined) person.ageAtDeath = age;
  return person;
}

export function parseCurrentUser(json: unknown): CurrentUser {
  const result = currentUserSchema.safeParse(json);
  if (!result.success) {
    throw new SchemaError(result.error.issues.map((issue) => issue.path.join('.')));
  }
  const user = result.data.users[0];
  if (!user) throw new SchemaError(['users']);
  const current: CurrentUser = {
    personId: user.personId,
    displayName: user.displayName ?? '',
    gender: toGender(user.gender),
  };
  if (user.birthDate) current.birthDate = user.birthDate;
  if (user.preferredLanguage) current.preferredLanguage = user.preferredLanguage;
  return current;
}
