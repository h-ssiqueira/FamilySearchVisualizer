# Module design

## 1. Source layout (proposed)
```
src/
  config/        environment (client ids, base URLs, limits)
  auth/          googleAuth, familySearchAuth, pkce, tokenStore
  api/           familySearchClient, requestQueue, endpoints, dto (schemas), mappers
  domain/        types (Person, Couple, ...), rules (siblings, dates, pedigree collapse)
  tree/          treeBuilder (V1/V2/V3), layout, selectors
  state/         session cache, view settings
  ui/            App shell, Login, TreeCanvas, PersonCard, Toolbar, status/error components
  i18n/          message catalogs
  test/          fixtures (anonymized), MSW handlers
```

## 2. Dependency rules
- `domain` imports nothing from the other modules.
- `api` depends on `domain` and `auth`; never on React.
- `tree` depends on `domain` and on the `FamilySearchClient` *interface*, not the implementation.
- `ui` depends on `tree`, `state`, `auth`; it never calls `fetch` directly.
- Enforce with an ESLint import-boundary rule.

## 3. Modules
| Module | Responsibility | Main public API |
|--------|----------------|-----------------|
| `auth/googleAuth` | Google sign-in, expose "signed in with Google" state | `signIn()`, `signOut()`, `useGoogleSession()` |
| `auth/familySearchAuth` | PKCE login, state check, token exchange, token in memory | `startLogin()`, `handleRedirect()`, `getAccessToken()`, `logout()` |
| `api/familySearchClient` | The single door to FamilySearch | `getCurrentUser()`, `getPersonDetails(id, signal)` |
| `api/requestQueue` | Concurrency limit, `Retry-After`, back-off, cancellation | `enqueue(task)` |
| `api/mappers` | DTO → domain with validation and date fallback | `toPerson(dto)`, `toCurrentUser(dto)` |
| `tree/treeBuilder` | Decides which persons to fetch for a view and assembles the tree | `build(rootId, view, options)` → async stream of `ViewTree` updates |
| `tree/layout` | Positions nodes (binary layout for ancestors, row layout for children) | `layout(viewTree)` → positioned nodes |
| `state/cache` | Person cache for the session; invalidation on logout | `get/put/clear` |
| `ui/TreeCanvas` | SVG rendering, pan/zoom, keyboard navigation | props: `positionedTree`, `onSelect` |
| `ui/PersonCard` | Card with name, life span, place, expandable details | props: `person`, `detail` |

## 3.1 Key interfaces (TypeScript sketch)
```ts
type PersonId = string;
type ViewLevel = "V1" | "V2" | "V3";

interface FamilySearchClient {
  getCurrentUser(signal?: AbortSignal): Promise<CurrentUser>;
  getPersonDetails(id: PersonId, signal?: AbortSignal): Promise<Person>;
}

interface TreeBuilder {
  build(rootId: PersonId, view: ViewLevel, options: { generations: number | "all" }, signal?: AbortSignal): AsyncIterable<ViewTree>;
}
```

## 4. Tree building algorithm
**V1 (ancestors)** – breadth-first by generation:
1. Fetch root details (full).
2. For each person in generation *g*, read `parentSets[0]` → parents (light). Fetch the parents' details for generation *g+1* (full), within the concurrency limit.
3. Depth is unlimited: after the first batch (proposed: 4 generations) the builder waits for the user ("next generation" / "load all") and continues until no parents are known; unknown parents become placeholders. Every step is cancellable.
4. Emit a `ViewTree` after each generation; report progress (generation, loaded, pending).

**V2** – starting from V1 nodes, for every `Couple` shown (parent couples of each ancestor, plus the root's unions) add `Couple.children` as light nodes; no extra requests. Upgrade to full on card expansion.

**V3** – for every child added by V2, fetch details (full) once; add `unions[*]` partners (light) and `Couple.children` of those unions (light).

**Cross-cutting**: cache lookup before any request; nodes keyed by `PersonId`; duplicated ancestors are drawn once and referenced with a marker.

## 5. Layout notes
- V1: classic horizontal pedigree (root left, generations to the right) or vertical (root bottom). Orientation to be chosen in UX design.
- V2/V3: children of a couple are laid out as a row/column under that couple; V3 adds a second row for each child's union.
- Unlimited depth means very large trees: SVG with pan/zoom plus viewport culling/virtualization from the start (not an optional optimization); collapse far branches on request.

## 6. Error handling
| Error | Behavior |
|-------|----------|
| 401 | Drop token, ask to re-authenticate (FR-04) |
| 403 / 404 on one person (e.g. restricted/living) | Render the node as "unavailable"; do not fail the tree |
| 429 / 503 | Wait `Retry-After`, retry, show waiting state |
| Network/timeout | Retry with back-off up to a limit, then show per-node retry |
| Schema validation failure | Log to console (no PII), show "unexpected response" for that node |
