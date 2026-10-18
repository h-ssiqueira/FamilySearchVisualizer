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
