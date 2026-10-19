## Retrieve current user information
GET https://www.familysearch.org/platform/users/current
* users[*].birthDate
* users[*].displayName
* users[*].gender
* users[*].personId
___
## Retrieve person information
GET https://www.familysearch.org/service/tree/tree-data/v8/person/GJ8L-919/details
### Data about the person
* ageAtDeath
* birth.details.date.formalText (fallback normalizedText)
* birth.details.place.id
* birth.details.place.normalizedText
* death.details.date.formalText (fallback normalizedText)
* death.details.place.id
* death.details.place.normalizedText
* gender
* id
* name
___
### Data about the person's parents
* parents[*].parent1.gender
* parents[*].parent1.id
* parents[*].parent1.name

* parents[*].parent2.gender
* parents[*].parent2.id
* parents[*].parent2.name
___
#### Parent's Marriage
* parents[*].event.details.date.formalText (fallback normalizedText)
* parents[*].event.details.place.id
* parents[*].event.details.place.normalizedText
___
#### Siblings
* parents[*].children[*].child.id
* parents[*].children[*].child.name
* parents[*].children[*].child.gender
___
### Data about the person's spouse/children
___
#### Marriage
* spouses[*].event.details.date.formalText (fallback normalizedText)
* spouses[*].event.details.place.id
* spouses[*].event.details.place.normalizedText
___
#### Spouse
* spouses[*].parent1.gender
* spouses[*].parent1.id
* spouses[*].parent1.name
___
#### Children
* spouses[*].children[*].child.id
* spouses[*].children[*].child.gender
* spouses[*].children[*].child.name

---
# Domain model (proposed)

The sections above describe the **API payload**. The app maps it once, in the mapping layer, to this **domain model**; the rest of the code never sees raw DTOs.

```
@startuml
class CurrentUser { personId: PersonId; displayName: string; gender: Gender; birthDate?: string }

class Person {
  id: PersonId
  name: string
  gender: Gender
  birth?: LifeEvent
  death?: LifeEvent
  ageAtDeath?: number
  detail: "light" | "full"
  parentSets: Couple[]     // empty when unknown
  unions: Couple[]         // spouses / partnerships
}

class Couple {
  partner1?: PersonRef
  partner2?: PersonRef
  event?: LifeEvent        // marriage
  children: PersonRef[]
}

class PersonRef { id: PersonId; name: string; gender: Gender }   // "light" data inside another person's response
class LifeEvent { date?: DateText; place?: Place }
class DateText  { text: string; source: "formal" | "normalized" }
class Place     { id?: string; text: string }
enum Gender { Male; Female; Unknown }

Person "1" o-- "*" Couple : parentSets
Person "1" o-- "*" Couple : unions
Couple "1" o-- "*" PersonRef
Person "1" o-- "0..2" LifeEvent
@enduml
```

## Mapping API → domain
| API | Domain | Rule |
|-----|--------|------|
| `id`, `name`, `gender` | `Person.id/name/gender` | Unknown gender → `Unknown` |
| `birth/death.details.date.formalText` | `LifeEvent.date.text` (`source: formal`) | If absent use `normalizedText` (`source: normalized`); if both absent, date is `undefined` |
| `birth/death.details.place.{id,normalizedText}` | `Place` | `id` optional |
| `ageAtDeath` | `Person.ageAtDeath` | Shown only when `death` exists |
| `parents[*]` | `Person.parentSets[*]` | Array: one entry per parent set (biological, adoptive, step…). `parent1`/`parent2` may be missing (single/unknown parent) |
| `parents[*].event` | `Couple.event` | Parents' marriage |
| `parents[*].children[*].child` | `Couple.children` | Includes the person themselves; siblings = children minus self |
| `spouses[*]` | `Person.unions[*]` | The spouse is in `parent1`; verify it is not the person themselves (**to verify with samples**) |
| `spouses[*].event` | `Couple.event` | Marriage |
| `spouses[*].children[*].child` | `Couple.children` | Children of that union |

## Rules and invariants
1. **Identity**: `PersonId` (e.g. `GJ8L-919`) is the only key. The same person reached by two paths (pedigree collapse) is one node in the cache.
2. **Light vs full**: a `PersonRef` inside another person's response is *light* (id, name, gender). A person loaded from its own details endpoint is *full* (dates, places, relatives). Views must work with light data and upgrade to full on demand.
3. **Parent order**: `parent1`/`parent2` are not guaranteed to be father/mother. Placement in the binary tree: male left, female right; otherwise `parent1` left (OQ-10).
4. **Several parent sets / spouses**: the model keeps all; views show the first and flag the rest (OQ-04).
5. **Dates are text**, not `Date` objects: genealogical dates can be partial, approximate or ranges (`formalText` follows a GEDCOM X-style format). Parsing is only for display.
6. **Names** come from user-generated content: treat as untrusted text (see security controls).

## View models (derived, not stored)
```
TreeNode  { person: Person | PersonRef; generation: number; role: "root"|"ancestor"|"spouse"|"child"|"grandchild"; parentCouple?: Couple }
TreeEdge  { from: PersonId; to: PersonId; kind: "parent"|"spouse"|"child" }
ViewTree  { view: "V1"|"V2"|"V3"; root: PersonId; nodes: TreeNode[]; edges: TreeEdge[]; pending: PersonId[] }
```
`pending` lists nodes still being loaded so the UI can render progressively.

## Open points
- Confirm with the samples in `8-attachments/examples.md` how `spouses[*].parent1/parent2` are populated (which one is the person?).
- Confirm whether `users/current` and person details use the same `personId` format.

---
# Documented API alternative (proposed, ADR-10 / OQ-06)

> The API sections at the top of this file describe the `service/tree/tree-data/v8` endpoint, which is **not documented** and may change without notice. The documented alternative below keeps the same domain model; only the mapping layer changes.

| Need | Documented endpoint (base `https://api.familysearch.org`) | Notes |
|------|-----------------------------------------------------------|-------|
| Current user | `GET /platform/users/current` | As today, on the `api.` host (FamilySearch asks that API requests use `api.familysearch.org`) |
| V1: ancestors | `GET /platform/tree/ancestry?person={id}&generations={n}&personDetails=` | Several generations per call (the guide states a maximum of 9). Each person carries an **ahnen number** that gives their position in the pedigree: this answers the left/right placement (OQ-10) |
| V2: children of a couple | `GET /platform/tree/descendancy?person={id}&generations=1&marriageDetails=&personDetails=` | Descendants numbered with d'Aboville numbers; spouses are included and numbered with `-S#` |
| V3: spouses of children and their children | same call with `generations=2` | One level more, as defined for V3 |
| Single person with relatives (lazy expansion of a card) | person / relationship resources (e.g. *person with relationships*) | **To verify** exact resource and fields in the spike |

Payloads follow the GEDCOM X JSON format (`persons[]`, `relationships[]`, `display` properties such as name, gender, lifespan, birth/death date and place, ascendancy/descendancy number). Exact field names must be confirmed against real responses; the domain model above does not change.

## Effect on request count (estimate, to be validated)
| View | Prototype endpoint | Documented API |
|------|--------------------|----------------|
| V1, g generations | up to 2^(g+1) − 1 requests | about ceil(g / 9) requests (more for the ends of very large trees) |
| V2 | +0 for names, +C for dates | one descendancy call per couple shown |
| V3 | +C | one descendancy call (2 generations) per couple shown |

Unlimited depth (ADR-09) then means: load up to 9 generations per call, and continue from the persons at the edge of the previous result.
