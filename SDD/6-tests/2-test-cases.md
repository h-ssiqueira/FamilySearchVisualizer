# Test cases

Format: Given / When / Then. Level: U unit, C component, I integration, E end-to-end, M manual.

Status notes: "(`file`)" points to the test that covers the case. "open" means the behaviour is not implemented or not tested yet. "Decided" means the expected behaviour is fixed, but the code may not follow it yet.

## Authentication
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-01 | FR-01 | C/E | Given no session, when the app opens, then only the "Sign in with Google (FamilySearch)" button is shown |
| TC-02 | FR-01 | C | The login button navigates to the configured login address (`VITE_FS_LOGIN_URL`) and to nothing else |
| TC-03 | FR-02 | I | Once a token is available, API calls carry `Authorization: Bearer` and only go to `www.familysearch.org` |
| TC-04 | FR-02, NFR-04 | I | The token never appears in the URL, console output, error messages, `localStorage` or `sessionStorage` |
| TC-05 | FR-01, FR-34 | I | Browser blocks the FamilySearch window → friendly message (`LoginScreen.relay.test.tsx`). Login cancelled or failed at FamilySearch: open |
| TC-06 | FR-03 | I | Logout → memory, `sessionStorage`, cache, open view and relay connection cleared; protected view not reachable (`session.test.ts`) |
| TC-07 | FR-04 | I | 401 on a person request → the token and relay go, the login screen says the session ended; the loaded tree and the open view are kept; after signing in the same view is shown (`session.test.ts`; the full flow is open) |
| TC-08 | NFR-04 | I | A token or login parameter that arrives in the URL is removed with `history.replaceState` before the router starts (`auth.test.ts`) |

## Data and mapping
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-10 | FR-05 | U | `users/current` mapped to `CurrentUser` (id, name, gender, birthDate) |
| TC-11 | FR-07 | U | `formalText` present → used; absent → `normalizedText`; both absent → unknown |
| TC-12 | FR-06 | U | Person with no death → no `ageAtDeath` shown |
| TC-13 | FR-19 | U | Two parent sets and two spouses → both kept in the model, with the preferred flag (`mappers.parentSets.test.ts`). The views show the preferred family only when one is flagged (`family.preferred.test.ts`; see TC-78). The families button: built for spouse families (TC-81); other parent sets: open |
| TC-14 | data model | U | Parent with only `parent1` → placeholder for the missing parent. Open: placeholders are not drawn; the unavailable card (TC-43) is used for missing data |
| TC-15 | FR-36, NFR-12 | C/U | Response in an unexpected shape → the person keeps its place, marked; the card says "Unexpected response" where the dates go; the rest of the tree goes on; its parents are not requested; a root in that state counts as a failure (`ancestors.invalid.test.ts`, `PersonCard.invalid.test.tsx`, `schemaError.test.ts`) |
| TC-16 | FR-10 | U | Same person requested twice → one network call (`personSource.test.ts`) |

## Views
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-20 | FR-11 | U | V1 depth 3 for a complete tree → 1+2+4+8 nodes, binary structure (`ancestors.test.ts`) |
| TC-21 | FR-11 | U | Unknown ancestors → the unavailable card of TC-43 is drawn in their place; recursion stops. Open: placeholders without a card |
| TC-22 | FR-11, R-06 | U | Pedigree collapse: same ancestor on two branches → one card, marked with the 🔄 symbol, with an edge from each child (`ancestors.repeated.test.ts`, `PersonCard.markers.test.tsx`). Decided placement: the symbol is on the card itself, not on a second card |
| TC-23 | FR-13 | U | V2: for each couple shown, all its children appear; siblings of root appear under root's parents (`family.test.ts`) |
| TC-24 | FR-13, FR-37 | I | V2: every relative shown gets its details, one request each; relatives already known come from the cache; the people on the line are not requested again (`family.details.test.ts`, `TreeScreen.test.tsx`) |
| TC-25 | FR-14 | U | V3: each child's spouse(s) and their children appear (`family.test.ts`) |
| TC-26 | FR-14 | I | V3 makes exactly one details request per child (`family.test.ts`) |
| TC-27 | FR-15 | I | Switch V3→V1→V3 → no repeated requests (`TreeScreen.test.tsx`; request count: open) |
| TC-28 | FR-12, FR-31 | U | "Next generation" / "load all" fetch only missing generations in a branch; loading stops when no parents remain in any branch (`ancestors.pending.test.ts`) |
| TC-29 | FR-17 | C | Card shows name, life span, birth place; "unknown" fallback (`PersonCard.test.tsx`) |
| TC-30 | FR-18 | C | Expanding a light card fetches details once (`PersonPanel.test.tsx`) |

## Resilience
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-40 | FR-09, NFR-03 | I | 429 with `Retry-After: 5` → all queued requests pause ~5 s, the toolbar shows the seconds left, then they resume (`requestQueue.wait.test.ts`, `TreeToolbar.wait.test.tsx`) |
| TC-41 | FR-23 | I | Never more than N requests in flight (`requestQueue.test.ts`) |
| TC-42 | NFR-03, FR-33 | I | Network failure (no answer) → retried with back-off (1 s, 2 s, 4 s); after the last retry the person is shown as not loaded and "retry" requests them again; an HTTP error answer is not retried by the client (`familySearchClient.backoff.test.ts`; the UI part is TC-46) |
| TC-43 | FR-38 | U, C | A restricted or missing person (no data) → a "Not available" card in its place, and its branch ends there (`ancestors.markers.test.ts`, `PersonCard.markers.test.tsx`) |
| TC-44 | F7 | I | Change view/root during loading → in-flight requests aborted, stale results ignored (builder abort in `ancestors.test.ts`; the UI flow is open) |
| TC-45 | FR-33 | U | One person fails with a transient error → the other branches keep loading; the person is listed as failed and as pending (`ancestors.failure.test.ts`) |
| TC-46 | FR-33 | C | Toolbar shows the count of people not loaded; "retry" rebuilds the tree and requests only the failed people again (`TreeScreen.retry.test.tsx`) |
| TC-47 | FR-33 | U | An expired session (401) stops the whole load; any other error only marks that person (`ancestors.failure.test.ts`) |
| TC-79 | FR-37, FR-33 | U | A relative whose details fail keeps its light card; an expired session stops the detail loading (`family.details.test.ts`) |

## Relay (FR-34)
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-48 | FR-34 | U | The app's window is opened inside the click; the handshake is sent to the relay origin only; a `ready` from another origin is ignored (`relayClient.test.ts`) |
| TC-49 | FR-34 | U | A request is answered with the relay's status, body and `Retry-After`; a reply from another origin is ignored; no reply in time → timeout (`relayClient.test.ts`) |
| TC-50b | FR-34 | U | The relay script answers only GET to the two allowed endpoints, only to the app origins and only to its opener; anything else gets 403 without calling FamilySearch (`relayScript.test.ts`) |
| TC-51b | FR-34, NFR-11 | U | The endpoint list in the relay script is identical to the app's allow-list (`relayScript.test.ts`) |
| TC-52b | FR-34 | M | Real session on familysearch.org: the relay answers the user, the token fallback is not needed. Open: check whether the session cookie alone authorises the endpoints |

## Non-functional
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-50 | NFR-06 | E | Whole tree reachable and operable with keyboard only; focus visible. Open: no keyboard navigation between cards |
| TC-51 | NFR-06 | E | axe: no serious/critical violations on login, V1, V2, V3. Open: only the login screen is checked (`e2e/smoke.spec.ts`) |
| TC-52 | NFR-06 | C | Gender conveyed by more than color (`PersonCard.test.tsx`) |
| TC-53 | NFR-02 | U | Request count for the first batch of 4 generations ≤ 31 (`ancestors.budget.test.ts`) |
| TC-54 | NFR-05 | E | No network request to hosts other than FamilySearch (`e2e/smoke.spec.ts`) |
| TC-55 | security | C | Name containing `<script>` or HTML renders as text (`security.test.tsx`) |
| TC-56 | NFR-07 | E | Login screen usable at 360 px width without sideways scrolling (`e2e/smoke.spec.ts`). The tree screens at 360 px: open |
| TC-57 | NFR-08 | C | All visible strings come from the i18n catalog; `en` and `pt-BR` have the same keys (`i18n.test.ts`) |
| TC-58 | FR-12 | I | Stop during "load all" aborts in-flight requests; already loaded nodes stay visible. Open |
| TC-59 | FR-12, NFR-02 | C | Tree with 1,000+ nodes: only visible nodes are rendered (`TreeCanvas.culling.test.tsx`). Pan/zoom responsiveness: open |
| TC-60 | NFR-11, ADR-10 | U | API client refuses any URL not on the documented-endpoint allow-list and any non-GET method (`allowList.test.ts`) |
| TC-74 | NFR-08 | U | Counts use the locale's separators (`1,234` / `1.234`); complete dates stay `yyyy-MM-dd` in every locale; prose dates pass through unchanged (`format.test.ts`) |

## UI cards and layout
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-61 | FR-17, FR-24 | C/U | The sketch's example renders four lines: `John Example` / `1800-12-31 - 1900-01-01 (99)` / `São Paulo, São Paulo, Brazil - São Paulo, São Paulo, Brazil` / `XXXX-XXX`. Under the flexible width the card grows with the text, up to 360 px (`cardWidth.test.ts`, `familyLayout.width.test.ts`). The sketch's example is therefore wider than 250 px |
| TC-62 | FR-25 | U | Complete date → `yyyy-MM-dd`; year only → `1800`; approximate/range text → raw text; none → empty (`dates.test.ts`) |
| TC-63 | FR-24 | C/U | Card width between 250 and 360 px, from the text (`cardWidth.test.ts`); above 360 px the text is truncated with an ellipsis and the tooltip shows the full text (`PersonCard.test.tsx`). The card height stays 90 px |
| TC-64 | FR-27, NFR-06 | C | Male, female and unknown cards differ by colour **and** by a non-colour cue; text contrast ≥ 4.5:1. Open: contrast is not checked |
| TC-65 | FR-26 | C | A couple shows a horizontal link with marriage date and place; missing marriage data hides only the missing parts (`familyLayout.test.ts`) |
| TC-66 | FR-28 | U | Parent couple: male card left of female card; child placed under the couple; spouse right of the person (`familyLayout.test.ts`) |
| TC-67 | FR-26 | C | Parent–child links are orthogonal, have no arrowheads, and meet at the top centre of the child card (`familyLayout.test.ts`) |
| TC-68 | FR-29 | U | A couple with 3 children → 3 cards in one row below the couple, left to right, no overlap (`familyLayout.test.ts`) |
| TC-69 | FR-29, FR-30 | U | Child without spouse → no spouse card, no placeholder, slot is 250 px wide; child with spouse → slot widened by the spouse area (`familyLayout.test.ts`) |
| TC-70 | FR-30 | U | Person with 2 spouses → both drawn to the right on the same row, each with its own marriage label (`familyLayout.test.ts`) |
| TC-71 | FR-25 | U | Living person → only the birth date, no dash, no death part, no age; deceased person → age shown (`cardText.test.ts`) |
| TC-75 | FR-26 | U | Siblings of the left partner lie on its left, siblings of the right partner on its right; no card crosses the marriage line, also when a sibling has a spouse (`familyLayout.siblings.test.ts`) |
| TC-78 | FR-19 | U | Person with two spouses: when one is flagged preferred, V2 shows only that spouse; when none is flagged, both are shown (`family.preferred.test.ts`) |
| TC-81 | FR-19, OQ-25 | U, C | The families button shows the number of families; each press shows the next spouse family on the card; the choice wraps around; no button for a person with one family (`family.families.test.ts`); the button is on the card and calls its handler (`TreeCanvas.families.test.tsx`). Parent families: open |

## Export (FR-22)
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-80 | FR-22 | C | SVG, PNG and PDF are offered; all three are disabled when the tree is empty; SVG downloads `family-tree.svg` (`ExportButton.test.tsx`). PNG and PDF downloads: open (need a browser) |
| TC-82 | FR-22 | U | The PDF has the header, the image size, the flate filter, a cross-reference table with one entry per object, and a `startxref` that points at it; the RGB conversion drops the alpha channel (`pdf.test.ts`) |

## Waiting indicator (FR-09)
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-72 | FR-09 | U | The queue exposes the pause while it lasts and notifies when it starts and when it ends (`requestQueue.wait.test.ts`) |
| TC-73 | FR-09 | C | The toolbar says "FamilySearch asked us to wait N s" before the loading message, and shows the normal status when nothing is waiting (`TreeToolbar.wait.test.tsx`) |

## Dark theme (FR-35)
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-76 | FR-35 | C | The theme button switches to dark, marks the page, remembers the choice, and switches back to light (`theme.test.tsx`) |
| TC-77 | FR-35 | C | With the choice "system" the page follows the operating system (no explicit marker); the button is labelled in pt-BR (`theme.test.tsx`). Visual contrast in dark mode: open |
