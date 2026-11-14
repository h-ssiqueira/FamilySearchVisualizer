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
| FR-08 | Data is loaded lazily, generation by generation, and rendered progressively. The first 4 generations load by themselves (OQ-02). | M |
| FR-09 | On HTTP 429/503 the queue pauses for `Retry-After`; the toolbar shows how many seconds are left ("FamilySearch asked us to wait N s") and the requests resume by themselves. | M |
| FR-10 | Responses are cached in memory for the session; the same person is never requested twice in one session unless refreshed. | S |
| FR-23 | Concurrency of outgoing requests is bounded (configurable, default proposed: 4). | M |
| FR-31 | "Load next generation" and "load all remaining" must consider each branch: loading never stops at one branch while another branch still has parents to load. | M |
| FR-33 | A person whose details fail with a transient error (throttling that does not end, network failure, server error) does not stop the rest of the tree. The person is shown as not loaded, the count is visible, and "retry" requests them again. Only a person with no data (not found, restricted) ends a branch, and only an expired session stops the load. | M |
| FR-36 | A person whose data comes back in an unexpected shape keeps its place on the tree, marked as "Unexpected response" where the dates go, with the name known from the parent entry; the rest of the tree goes on and that person's parents are not requested (TC-15). | M |
| FR-37 | In V2 and V3, every relative shown has its details loaded (one request each, cached), so that its card shows dates and places as well (OQ-05). A relative that cannot be loaded keeps a light card (FR-33). | M |
| FR-38 | A parent or spouse with no data (restricted, not found) is shown as an "unavailable" card in its place, and its branch ends there (TC-43). Its name, when known from the parent entry, is shown. | M |
| FR-39 | Every person who cannot be loaded (transient failure, no data, unexpected data) is written to the browser console with the person's id, the name when known, and the reason (the error class and message). Written once per person and reason within one load. Never a token or a response payload. The console is the user's own browser; nothing is sent anywhere (NFR-05). | S |

## Views
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-11 | **V1** shows the root and direct ancestors as a binary tree; missing parents render as placeholders (not yet drawn: the unavailable card of FR-38 is used instead); a second occurrence of the same ancestor is marked with the 🔄 icon on its card (TC-22, OQ-24, OQ-26). | M |
| FR-12 | Ancestor depth is **unlimited**. The app auto-loads a first batch of generations (4, OQ-02), then offers "load next generation" and "load all remaining"; loading shows progress and can be paused/cancelled at any time; it stops by itself when no further parents are known in any branch (see FR-31). | M |
| FR-13 | **V2** adds, for every couple shown, all their children (including the root's own spouse and children). | M |
| FR-14 | **V3** adds the spouses of the children shown in V2 and the children of those unions. | M |
| FR-15 | The user can switch V1/V2/V3 without reloading data already cached. | M |
| FR-16 | Selecting a person opens a panel with the person's details and a link to the person's page on familysearch.org. | C |
| FR-17 | A person card shows four lines: name; birth date – death date (age); birth place – death place; person id (see [UI spec](../4-design/5-ui-spec.md)). This holds for every person drawn, in V1, V2 and V3; relatives in V2 and V3 get their details first (FR-37). | M |
| FR-18 | A card can be expanded to show death place, marriages and the FamilySearch id with a link to the person on familysearch.org. | S |
| FR-19 | Preferred family (OQ-04): parent families show the preferred one (the first when none is flagged); spouse families show only the flagged ones when one is flagged, and every spouse when none is flagged (FR-30). A person with several spouse families shows a button with two crossed arrows; each press shows the next family on the same card, and the button shows the number of families (OQ-23, OQ-25). Built for spouse families. Other parent sets are not yet selectable. | S |
| FR-20 | Loading, empty, partial-failure and error states are visible and recoverable (retry per node, FR-33). | M |
| FR-21 | Pan and zoom of the tree canvas. | S |
| FR-22 | Export the current view as SVG, PNG or PDF. The PNG and PDF are drawn at twice the size of the screen layout. The PDF is one page with one image, built without an external library. The graph page export is planned after its first implementation (OQ-30). | C |
| FR-24 | Cards have a flexible width, between 250 px (minimum) and 360 px (maximum), with a fixed height of 90 px (OQ-19, OQ-22). The width is estimated from the text, so the layout and the card agree. Text above the maximum is truncated with an ellipsis and the full text is in a tooltip. | M |
| FR-25 | Dates are shown as `yyyy-MM-dd` when complete, in every locale; partial, approximate or range dates show only what is known or the raw text; no invented day/month. Age is shown only for deceased people; living people show only the birth date. | M |
| FR-26 | Partners are joined by a horizontal line labelled with the marriage date and location; no card lies on that line: the siblings of each partner are placed on its outer side; children hang from both parents with orthogonal lines; no arrowheads. | M |
| FR-27 | Gender is shown by card colour (blue = male, pink = female, neutral grey = unknown) **and** by a non-colour cue (NFR-06). | M |
| FR-28 | Layout as sketched: vertical, ancestors above and descendants below (root at the bottom); man left and woman right in a parent couple (OQ-10: otherwise the first parent entry on the left); a person's spouse to the right. | M |
| FR-29 | Several children of a couple are drawn side by side in one row below the couple; each child's slot reserves room for spouses only if they exist. Large groups stay in one row, with pan and zoom (OQ-20). | M |
| FR-30 | Several spouses of one person are drawn to the right at the same level, each with its own marriage link; a person without a known spouse gets no spouse card and no placeholder. | M |
| FR-32 | Menu icons, buttons and the interface have priority over the tree: the tree must never cover or override them. | M |
| FR-34 | The app reads the tree through a FamilySearch tab that the user opens from the app and marks with a bookmarklet (relay). The relay answers only the two allowed GET endpoints, only to the app's origin, and only while the user's FamilySearch session is active. | M |
| FR-35 | The interface has a dark theme. It follows the system setting by default; a control on every screen switches between light and dark, and the choice is remembered in this browser. Cards keep light colours so that their text stays readable. The exported SVG keeps a white background. | S |

## Graph page (proposed, see [force-graph design](4-design/7-force-graph-view.md))
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-40 | A second page shows the people and relations of the same view as a 2D force-directed graph, drawn with the `force-graph` library. The tree page is unchanged. The library is loaded as a separate chunk when the page opens (OQ-31). | S |
| FR-41 | The page is at the route `#/graph`. The user switches between the tree and the graph with a control on each page; the view level (V1/V2/V3) and the loaded data are shared, so no new FamilySearch request is made for people already loaded. | S |
| FR-42 | The graph uses a free force layout (OQ-29). It follows the same connection rules as the tree: each parent and child is joined by a solid link, and the two partners of a couple by a dashed marriage link, with the marriage date and place; partners are kept close. Ancestors are not forced into rows. | S |
| FR-43 | Each node shows the same card content and colours as the tree: four lines (FR-17), gender colour and cue (FR-27), the unexpected, unavailable and repeated notes (FR-36, FR-38, FR-11). | S |
| FR-44 | Clicking a node selects that person and opens the details panel (FR-16); nodes can be dragged; the graph can be panned and zoomed. | S |
| FR-45 | The graph page has an accessible list of the same people, operable with the keyboard; selecting a row selects the same person as a click on the graph (NFR-06). | S |
