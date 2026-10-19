# Functional requirements

Priority: **M**ust / **S**hould / **C**ould (v1 scope = M and S).

## Authentication
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-01 | The user signs in through FamilySearch's own login page, where Google can be chosen as the sign-in method. The app has no separate Google sign-in. | M |
| FR-02 | The app uses the FamilySearch OAuth2 authorization code flow with PKCE (S256) and `state` to obtain the access token. | M |
| FR-03 | The user can sign out; tokens and cached family data are wiped from memory and browser storage. | M |
| FR-04 | When the FamilySearch token expires or is rejected (401), the user is asked to re-authenticate, keeping the selected view. | S |

## Data loading
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-05 | Load `users/current` to obtain `personId`, `displayName`, `gender`, `birthDate`. | M |
| FR-06 | Load person details by id and map them to the domain model (see data model). | M |
| FR-07 | Dates use `formalText`, falling back to `normalizedText`; missing values render as "unknown". | M |
| FR-08 | Data is loaded lazily, generation by generation, and rendered progressively. | M |
| FR-09 | On HTTP 429/503 the app waits for `Retry-After` and retries; the user sees a "waiting" indicator. | M |
| FR-10 | Responses are cached in memory for the session; the same person is never requested twice in one session unless refreshed. | S |
| FR-23 | Concurrency of outgoing requests is bounded (configurable, default proposed: 4). | M |

## Views
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-11 | **V1** shows the root and direct ancestors as a binary tree; missing parents render as placeholders. | M |
| FR-12 | Ancestor depth is **unlimited**. The app auto-loads a first batch of generations (proposed: 4), then offers "load next generation" and "load all remaining"; loading shows progress and can be paused/cancelled at any time; it stops by itself when no further parents are known. | M |
| FR-13 | **V2** adds, for every couple shown, all their children (including the root's own spouse and children). | M |
| FR-14 | **V3** adds the spouses of the children shown in V2 and the children of those unions. | M |
| FR-15 | The user can switch V1/V2/V3 without reloading data already cached. | M |
| FR-16 | Selecting a person re-roots the tree on that person. | C |
| FR-17 | A person card shows four lines: name; birth date – death date (age); birth place – death place; person id (see [UI spec](../4-design/5-ui-spec.md)). | M |
| FR-18 | A card can be expanded to show death place, marriages and the FamilySearch id with a link to the person on familysearch.org. | S |
| FR-19 | When a person has several parent sets or spouses, the app shows the first set/spouse and indicates others exist (OQ-04). | S |
| FR-20 | Loading, empty, partial-failure and error states are visible and recoverable (retry per node). | M |
| FR-21 | Pan and zoom of the tree canvas. | S |
| FR-22 | Export current view as image/PDF. | C |
| FR-24 | Cards have a fixed height (90 px) and a width of 250 px (up to 330 px for long places, OQ-19); long text is truncated with an ellipsis and available in a tooltip. | M |
| FR-25 | Dates are shown as `yyyy-MM-dd` when complete; partial, approximate or range dates show only what is known or the raw text; no invented day/month. | M |
| FR-26 | Partners are joined by a horizontal line labelled with the marriage date and location; children hang from both parents with orthogonal lines; no arrowheads. | M |
| FR-27 | Gender is shown by card colour (blue = male, pink = female, neutral = unknown) **and** by a non-colour cue (NFR-06). | M |
| FR-28 | Layout as sketched: ancestors above, descendants below; man left and woman right in a parent couple; a person's spouse to the right (OQ-17, OQ-18). | M |
