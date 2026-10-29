# Software Design Document – FamilySearch Visualizer

Read-only, client-side web app that shows a FamilySearch family tree in progressively richer views, starting from the signed-in user.

## Index
| # | Section | Files |
|---|---------|-------|
| 1 | Overview | [context](1-overview/1-context.md), [objective](1-overview/2-objective.md) |
| 2 | Requirements | [functional](2-requirements/1-functional.md), [non-functional](2-requirements/2-non-functional.md) |
| 3 | Architecture | [vision](3-architecture/1-arch-vision.md), [diagrams](3-architecture/2-diagrams.md), [technologies](3-architecture/3-technologies.md) |
| 4 | Design | [data model](4-design/1-data-model.md), [modules](4-design/2-module-design.md), [interfaces](4-design/3-interfaces.md), [flows](4-design/4-flows.md), [UI spec](4-design/5-ui-spec.md), [API findings](4-design/6-api-findings.md) |
| 5 | Security | [auth](5-security/1-auth-authorization.md), [controls](5-security/2-security-controls.md) |
| 6 | Tests | [strategy](6-tests/1-strategy.md), [test cases](6-tests/2-test-cases.md) |
| 7 | Operations | [deploy](7-operations/1-deploy.md), [monitoring](7-operations/2-monitoring.md), [backup & recovery](7-operations/3-backup-recovery.md), [scaffold checklist](7-operations/4-scaffold-checklist.md) |
| 8 | Attachments | [examples](8-attachments/examples.md), [glossary](8-attachments/glossary.md) |

## Conventions
- IDs: `FR-xx` functional, `NFR-xx` non-functional, `ADR-xx` decisions, `TC-xx` test cases, `OQ-xx` open questions, `R-xx` risks.
- Status tags: **Decided** (confirmed by the author), **Proposed** (drafted, needs confirmation), **Assumption** (inferred, verify).

## Decisions confirmed so far
- Pure client-side SPA hosted on GitHub Pages (no backend).
- Login (OQ-21 decided): the user signs in with Google through FamilySearch's identity service, at `https://ident.familysearch.org/oauth2/authorization/google` (first lines of `examples.md`); the app has no Google client or SDK, no OAuth client id, no redirect URI and no PKCE.
- **Relay (FR-34):** the app reads the tree through a FamilySearch tab that the user opens from the app and marks with a bookmarklet. The bearer token is only a fallback. **Unverified:** whether the session cookie alone authorises the two endpoints (TC-52b).
- **Auto-load (OQ-02 decided):** the first 4 generations load by themselves; the rest on request ("next" or "all").
- V1 ancestor depth is **unlimited**: loaded incrementally, generation by generation, always cancellable (ADR-09).
- Views confirmed (OQ-03 resolved): V1 direct line; V2 = V1 + all children of every couple shown; V3 = V2 + the spouses of those children and their children, one level only (see [objective](1-overview/2-objective.md)).
- **Relatives show their details (OQ-05 decided):** every card drawn shows the four lines, dates and places included. Relatives in V2 and V3 are loaded with one request each, served from the cache when already known; a relative that cannot be loaded keeps a light card (FR-33).
- **Preferred family (OQ-04 decided):** parent families always show the preferred one (the first when none is flagged). Spouse families: when one is flagged as preferred, only the flagged ones are shown; when none is flagged, every spouse is shown (FR-30). **Indicator of the other families (OQ-23 decided: yes; form open).**
- **Large sibling groups (OQ-20 decided):** one long row, with pan and zoom. No wrapping into several rows.
- **Card width (OQ-19 decided): flexible.** The fixed 250 px width is replaced; the exact limits are open (OQ-22).
- **Unavailable people (TC-43 decided):** a restricted or missing parent or spouse shows an "unavailable" card in its place (FR-38).
- **Pedigree collapse (TC-22):** the second occurrence of an ancestor will be marked; the form of the marker is open (OQ-24).
- **Telemetry (OQ-11 decided): zero.** No analytics, no error reporting service, no third-party scripts (NFR-05).
- **Dates (NFR-08 vs FR-25 resolved):** complete dates stay `yyyy-MM-dd` in every locale (FR-25). Prose dates come localized from FamilySearch. Numbers and counts follow the locale (NFR-08).
- **Unexpected data (TC-15 decided):** a person whose data comes back in an unexpected shape keeps its place on the tree, marked "Unexpected response", and the rest of the tree goes on.
- **Parents of the same sex or unknown gender (OQ-10 decided):** the first parent entry (`parent1`) is drawn on the left.
- **Endpoints (OQ-06 resolved):** the app uses the endpoints exactly as in `8-attachments/examples.md` (the website's `platform/users/current` and `service/tree/tree-data/v8/person/{id}/details`); ADR-10 (documented API) is **not adopted** and stays as a fallback. What the samples show is in [API findings](4-design/6-api-findings.md).
- **Languages (OQ-08 resolved):** English and Brazilian Portuguese (pt-BR), designed to be extended with more locales (ADR-11).
- **URL (OQ-12 decided, confirmed by the author):** `https://h-ssiqueira.github.io/FamilySearchVisualizer/` (the repository name is the path). Vite `base` = `/FamilySearchVisualizer/`.
- Developer key, app registration and FamilySearch's compatibility review are **out of scope** of this SDD (author's decision). No OAuth client id or redirect URI is used.
- `4-design/3-interfaces.md` is a draw.io card/layout sketch with synthetic data; the [UI spec](4-design/5-ui-spec.md) is derived from it. UI decisions: living people show no age; unknown gender is neutral grey; several children side by side with room for spouses only if they exist; several spouses at the same level; vertical orientation with the root at the bottom; card width flexible (OQ-19, limits in OQ-22). `8-attachments/examples.md` holds real personal data and live credentials (action A3, urgent).

## Action items
| ID | Action | Why |
|----|--------|-----|
| A1 | ~~Create developer account / register app~~ **Dropped** (out of scope) | – |
| A2 | Run the spike in [arch vision](3-architecture/1-arch-vision.md): what the login address returns to a page on `github.io` (OQ-21), CORS for the two endpoints of `examples.md`, response shape and size, throttling | Confirms ADR-01 and ADR-02 are viable |
| A3 | **URGENT, owner: the author** (will remove the file and clean the history). `8-attachments/examples.md` contains a live Bearer token / session cookie, e-mail, phone, helper PIN, IP address, ids and real people (one living). Sign out of FamilySearch everywhere, remove the file from the repository **and from Git history** (git filter-repo or BFG, force-push, and ask GitHub to purge cached views if the repository is or was public), then keep a redacted copy for the SDD. See [API findings](4-design/6-api-findings.md) section 6 | Account takeover risk and privacy of living people |
| A6 | Move the diagram from `3-interfaces.md` to a `.drawio` / `.svg` file in `8-attachments/` and link it (the Markdown is 99 % base64) | Readability, repository size |
| A7 | Execute the [scaffold checklist](7-operations/4-scaffold-checklist.md) (first settle its section 0 decisions) | Working, tested, deployable base for feature work |
| A4 | ~~Ask FamilySearch developer support~~ **Dropped** (out of scope) | – |
| A5 | ~~Decide OQ-06~~ **Done**: endpoints as in `examples.md` | – |

## Open questions
| ID | Question | Affects |
|----|----------|---------|
| OQ-01 | ~~Google login mechanism~~ **Resolved:** Google is used through FamilySearch's identity service, at `https://ident.familysearch.org/oauth2/authorization/google`; the app never talks to Google. The address could not be opened for inspection (automated access blocked) and is not part of the documented OAuth flow. | 5-security |
| OQ-02 | ~~Maximum generations~~ **Resolved: unlimited.** ~~How many to auto-load~~ **Decided: 4**, then on request. | FR-12, ADR-09 |
| OQ-03 | ~~V2/V3 interpretation~~ **Resolved: confirmed.** | FR-13, FR-14 |
| OQ-04 | ~~Several parent sets or spouses~~ **Decided:** show the preferred family (see decisions); indicator of the others: OQ-23. | FR-19, data model |
| OQ-05 | ~~Do all cards need dates/places?~~ **Decided: yes.** Relatives in V2 and V3 are loaded with their details, one request each (see decisions). | FR-17, NFR-02, flows |
| OQ-06 | ~~Documented API or internal endpoint?~~ **Resolved:** use the endpoints as in `examples.md`. ADR-10 not adopted (kept as fallback). Accepted risk: the endpoints may change without notice (R-01). | R-01, data model |
| OQ-07 | ~~Developer key status~~ **Dropped** (out of scope, author's decision). | – |
| OQ-08 | ~~UI languages~~ **Resolved:** English and pt-BR, extensible to other locales (ADR-11). | NFR-08 |
| OQ-09 | ~~Real people in the samples~~ **Confirmed:** `examples.md` has real data and live credentials (action A3); `3-interfaces.md` is synthetic. | NFR-05, R-05, R-07 |
| OQ-10 | ~~Placement of parents~~ **Decided:** the first parent entry (`parent1`) on the left when gender does not decide (same sex or unknown); man left, woman right otherwise. | data model, FR-11 |
| OQ-11 | ~~Telemetry~~ **Decided: zero telemetry** (see decisions; NFR-05). | 7-operations, NFR-05 |
| OQ-12 | ~~Final URL~~ **Decided:** `https://h-ssiqueira.github.io/FamilySearchVisualizer/`, confirmed by the author. | 7-operations |
| OQ-13 | ~~Production review~~ **Dropped** (out of scope, author's decision). | – |
| OQ-14 | ~~Public client type / client secret~~ **Dropped**: no OAuth client is used. | – |
| OQ-15 | ~~Age for living people~~ **Decided:** no age. | 4-design/5-ui-spec |
| OQ-16 | ~~Unknown gender colour~~ **Decided:** neutral grey. | 4-design/5-ui-spec |
| OQ-17 | ~~Several children / spouses~~ **Decided:** children side by side with room for spouses if they exist; several spouses at the same level; no spouse means no card. | 4-design/5-ui-spec |
| OQ-18 | ~~Orientation~~ **Decided:** vertical, root at the bottom. | 4-design/5-ui-spec |
| OQ-19 | ~~Card width~~ **Decided: flexible** (see decisions). Limits: OQ-22. | 4-design/5-ui-spec |
| OQ-20 | ~~Very many children in one row~~ **Decided:** one long row, with pan and zoom; no wrapping. | 4-design/5-ui-spec |
| OQ-21 | ~~How does the SPA get a token?~~ **Decided (author):** through the Google login address above, as in the first lines of `examples.md`. **Open verification:** the samples use the website's session id as Bearer token and run same-origin; a page on `github.io` cannot read that session, so the spike must prove how the token reaches the SPA. Fallbacks if not: paste the token; run on familysearch.org; small proxy (reverses ADR-01). The relay (FR-34) is the path in use. | ADR-01, ADR-02, auth, R-02 |
| OQ-22 | **New.** Flexible card width: minimum and maximum width in px, and whether the text wraps or is truncated at the maximum. Proposal: minimum 250 px, maximum 360 px, truncation with a tooltip above the maximum. | FR-24, TC-61, TC-63, layout |
| OQ-23 | **New.** Form of the indicator that other families exist (FR-19): a count on the card, a button in the details panel, or a line under the card? | FR-19, FR-18, UI spec |
| OQ-24 | **New.** Form of the pedigree-collapse marker (TC-22): text such as "see above", a colour, or an icon? | FR-11, TC-22, UI spec |
