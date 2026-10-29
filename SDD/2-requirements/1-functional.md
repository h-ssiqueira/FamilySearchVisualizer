# Functional requirements

Priority: **M**ust / **S**hould / **C**ould (v1 scope = M and S).

## Authentication
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-01 | The user signs in with Google through FamilySearch's identity service (login address from `examples.md`). The app has no Google client or SDK. | M |
| FR-02 | The app obtains the FamilySearch session through the relay (FR-34) or, as a fallback, through a bearer token the user pastes; it keeps the token in memory only and sends it as `Authorization: Bearer` to FamilySearch endpoints only. | M |
| FR-03 | The user can sign out; tokens and cached family data are wiped from memory and browser storage, the relay connection is closed and the open view is forgotten. | M |
| FR-04 | When the FamilySearch session ends (401), the user is asked to sign in again. The tree already loaded and the open view are kept in memory, so after signing in the app shows the same view without loading everything again. | M |

## Data loading
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-05 | Load `users/current` to obtain `personId`, `displayName`, `gender`, `birthDate`. | M |
| FR-06 | Load person details by id and map them to the domain model (see data model). | M |
| FR-07 | Dates use `formalText`, falling back to `normalizedText`; missing values render as "unknown". | M |
| FR-08 | Data is loaded lazily, generation by generation, and rendered progressively. | M |
| FR-09 | On HTTP 429/503 the queue pauses for `Retry-After`; the toolbar shows how many seconds are left ("FamilySearch asked us to wait N s") and the requests resume by themselves. | M |
| FR-10 | Responses are cached in memory for the session; the same person is never requested twice in one session unless refreshed. | S |
| FR-23 | Concurrency of outgoing requests is bounded (configurable, default proposed: 4). | M |
| FR-31 | "Load next generation" and "load all remaining" must consider each branch: loading never stops at one branch while another branch still has parents to load. | M |
| FR-33 | A person whose details fail with a transient error (throttling that does not end, network failure, server error) does not stop the rest of the tree. The person is shown as not loaded, the count is visible, and "retry" requests them again. Only a person with no data (not found, restricted) ends a branch, and only an expired session stops the load. | M |
| FR-36 | A person whose data comes back in an unexpected shape keeps its place on the tree, marked as "Unexpected response" where the dates go, with the name known from the parent entry; the rest of the tree goes on and that person's parents are not requested (TC-15). | M |

## Views
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-11 | **V1** shows the root and direct ancestors as a binary tree; missing parents render as placeholders. | M |
| FR-12 | Ancestor depth is **unlimited**. The app auto-loads a first batch of generations (proposed: 4), then offers "load next generation" and "load all remaining"; loading shows progress and can be paused/cancelled at any time; it stops by itself when no further parents are known in any branch (see FR-31). | M |
| FR-13 | **V2** adds, for every couple shown, all their children (including the root's own spouse and children). | M |
| FR-14 | **V3** adds the spouses of the children shown in V2 and the children of those unions. | M |
| FR-15 | The user can switch V1/V2/V3 without reloading data already cached. | M |
| FR-16 | Selecting a person opens a panel with the person's details and a link to the person's page on familysearch.org. | C |
| FR-17 | A person card shows four lines: name; birth date – death date (age); birth place – death place; person id (see [UI spec](../4-design/5-ui-spec.md)). | M |
| FR-18 | A card can be expanded to show death place, marriages and the FamilySearch id with a link to the person on familysearch.org. | S |
| FR-19 | Preferred family only (OQ-04): parent families show the preferred one (the first when none is flagged); spouse families show only the flagged ones when one is flagged, and every spouse when none is flagged (FR-30). The other families are not drawn; an indicator that they exist is not built yet. | S |
| FR-20 | Loading, empty, partial-failure and error states are visible and recoverable (retry per node, FR-33). | M |
| FR-21 | Pan and zoom of the tree canvas. | S |
| FR-22 | Export current view as image/PDF. | C |
| FR-24 | Cards have a fixed size (250 × 90 px); long text is truncated with an ellipsis and the full text is available in a tooltip. | M |
| FR-25 | Dates are shown as `yyyy-MM-dd` when complete, in every locale; partial, approximate or range dates show only what is known or the raw text; no invented day/month. Age is shown only for deceased people; living people show only the birth date. | M |
| FR-26 | Partners are joined by a horizontal line labelled with the marriage date and location; no card lies on that line: the siblings of each partner are placed on its outer side; children hang from both parents with orthogonal lines; no arrowheads. | M |
| FR-27 | Gender is shown by card colour (blue = male, pink = female, neutral grey = unknown) **and** by a non-colour cue (NFR-06). | M |
| FR-28 | Layout as sketched: vertical, ancestors above and descendants below (root at the bottom); man left and woman right in a parent couple; a person's spouse to the right. | M |
| FR-29 | Several children of a couple are drawn side by side in one row below the couple; each child's slot reserves room for spouses only if they exist. | M |
| FR-30 | Several spouses of one person are drawn to the right at the same level, each with its own marriage link; a person without a known spouse gets no spouse card and no placeholder. | M |
| FR-32 | Menu icons, buttons and the interface have priority over the tree: the tree must never cover or override them. | M |
| FR-34 | The app reads the tree through a FamilySearch tab that the user opens from the app and marks with a bookmarklet (relay). The relay answers only the two allowed GET endpoints, only to the app's origin, and only while the user's FamilySearch session is active. | M |
| FR-35 | The interface has a dark theme. It follows the system setting by default; a control on every screen switches between light and dark, and the choice is remembered in this browser. Cards keep light colours so that their text stays readable. The exported SVG keeps a white background. | S |
