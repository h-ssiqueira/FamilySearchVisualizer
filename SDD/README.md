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
- Login: the user signs in on **FamilySearch's own login page** (OAuth2 authorization code + PKCE, **under review**: OQ-21). Google is one of the sign-in methods offered *there*; the app has no separate Google sign-in, no Google client and no Google SDK (OQ-01 resolved).
- V1 ancestor depth is **unlimited**: loaded incrementally, generation by generation, always cancellable (ADR-09).
- Views confirmed (OQ-03 resolved): V1 direct line; V2 = V1 + all children of every couple shown; V3 = V2 + the spouses of those children and their children, one level only (see [objective](1-overview/2-objective.md)).
- **Endpoints (OQ-06 resolved):** the app uses the endpoints exactly as in `8-attachments/examples.md` (the website's `platform/users/current` and `service/tree/tree-data/v8/person/{id}/details`); ADR-10 (documented API) is **not adopted** and stays as a fallback. What the samples show is in [API findings](4-design/6-api-findings.md).
- **Languages (OQ-08 resolved):** English and Brazilian Portuguese (pt-BR), designed to be extended with more locales (ADR-11).
- **URL (OQ-12 resolved):** the repository's default GitHub Pages address, project page at the Pages root of the repository: `https://h-ssiqueira.github.io/FamilySearchVisualizer/` (host derived from the owner name, to confirm); Vite `base` = `/FamilySearchVisualizer/`.
- Developer key, app registration and FamilySearch's compatibility review are **out of scope** of this SDD (author's decision). The OAuth `client_id` and the redirect URIs are treated as build-time configuration.
- `4-design/3-interfaces.md` is a draw.io card/layout sketch with synthetic data; the [UI spec](4-design/5-ui-spec.md) is derived from it. UI decisions: living people show no age; unknown gender is neutral grey; several children side by side with room for spouses only if they exist; several spouses at the same level; vertical orientation with the root at the bottom; fixed 250 px cards with truncation (OQ-15 to OQ-19). `8-attachments/examples.md` holds real personal data and live credentials (action A3, urgent).

## Action items
| ID | Action | Why |
|----|--------|-----|
| A1 | ~~Create developer account / register app~~ **Dropped** (out of scope) | – |
| A2 | Run the spike in [arch vision](3-architecture/1-arch-vision.md) (token mechanism OQ-21, CORS, response shape and size, throttling for the two endpoints of `examples.md`) | Confirms ADR-01 is viable |
| A3 | **URGENT.** `8-attachments/examples.md` contains a live Bearer token / session cookie, e-mail, phone, helper PIN, IP address, ids and real people (one living). Sign out of FamilySearch everywhere, remove the file from the repository **and from Git history** (git filter-repo or BFG, then force-push and ask GitHub to purge cached views if the repository is or was public), and replace it with a redacted sample. See [API findings](4-design/6-api-findings.md) section 6 | Account takeover risk and privacy of living people |
| A6 | Move the diagram from `3-interfaces.md` to a `.drawio` / `.svg` file in `8-attachments/` and link it (the Markdown is 99 % base64) | Readability, repository size |
| A7 | Execute the [scaffold checklist](7-operations/4-scaffold-checklist.md) (first settle its section 0 decisions) | Working, tested, deployable base for feature work |
| A4 | ~~Ask FamilySearch developer support~~ **Dropped** (out of scope) | – |
| A5 | ~~Decide OQ-06~~ **Done**: endpoints as in `examples.md` | – |

## Open questions
| ID | Question | Affects |
|----|----------|---------|
| OQ-01 | ~~Google login mechanism~~ **Resolved:** Google is used on FamilySearch's login page; the app never talks to Google. Note: the URL `https://ident.familysearch.org/oauth2/authorization/google` could not be opened (the site blocks automated access) and it is not part of the documented flow, so the app should start from the documented authorization endpoint and let the user choose Google there. | 5-security |
| OQ-02 | ~~Maximum generations~~ **Resolved: unlimited.** Remaining: how many generations to auto-load before asking the user to continue (proposed: 4)? | FR-12, ADR-09 |
| OQ-03 | ~~V2/V3 interpretation~~ **Resolved: confirmed.** | FR-13, FR-14 |
| OQ-04 | People can have several parent sets (biological, adoptive, step) and several spouses. Show only the first/preferred, or let the user switch? | FR-19, data model |
| OQ-05 | Do all cards need dates/places or can cards show name only until selected? | NFR-02, flows |
| OQ-06 | ~~Documented API or internal endpoint?~~ **Resolved:** use the endpoints as in `examples.md`. ADR-10 not adopted (kept as fallback). Accepted risk: the endpoints may change without notice (R-01). | R-01, data model |
| OQ-07 | ~~Developer key status~~ **Dropped** (out of scope, author's decision). | – |
| OQ-08 | ~~UI languages~~ **Resolved:** English and pt-BR, extensible to other locales (ADR-11). | NFR-08 |
| OQ-09 | ~~Real people in the samples~~ **Confirmed:** `examples.md` has real data and live credentials (action A3); `3-interfaces.md` is synthetic. | NFR-05, R-05, R-07 |
| OQ-10 | ~~Placement of parents~~ **As drawn in the sketch:** man left, woman right (confirm; same-sex or unknown gender: `parent1` left). In the samples `parent1` is the man, which matches this layout. | data model, FR-11 |
| OQ-11 | Is client-side error reporting (e.g. Sentry) acceptable, or zero telemetry? | 7-operations |
| OQ-12 | ~~Final URL~~ **Resolved:** default repository Pages URL (see decisions). | 7-operations, OAuth redirect |
| OQ-13 | ~~Production review~~ **Dropped** (out of scope, author's decision). | – |
| OQ-14 | ~~Public client type / client secret~~ **Dropped** (out of scope, author's decision). | – |
| OQ-15 | ~~Age for living people~~ **Decided:** no age. | 4-design/5-ui-spec |
| OQ-16 | ~~Unknown gender colour~~ **Decided:** neutral grey. | 4-design/5-ui-spec |
| OQ-17 | ~~Several children / spouses~~ **Decided:** children side by side with room for spouses if they exist; several spouses at the same level; no spouse means no card. | 4-design/5-ui-spec |
| OQ-18 | ~~Orientation~~ **Decided:** vertical, root at the bottom. | 4-design/5-ui-spec |
| OQ-19 | ~~Card width~~ **Decided:** fixed 250 px with truncation (tooltip shows full text). | 4-design/5-ui-spec |
| OQ-20 | Families with very many children in one row (e.g. 15+): one long row with pan/zoom, or wrap into several rows? | 4-design/5-ui-spec |
| OQ-21 | **Critical. How does the SPA get a token?** The samples use the website's own session id as Bearer token and run same-origin. A page on `github.io` cannot read that session, and without a registered `client_id` the OAuth/PKCE flow in [auth](5-security/1-auth-authorization.md) cannot run. Options: (a) the user **pastes their Bearer token** into the app; (b) OAuth + PKCE with a `client_id` (needs a registered app); (c) run the code **on familysearch.org** (bookmarklet, user script or browser extension) where calls are same-origin; (d) a small proxy (breaks ADR-01). | ADR-01, ADR-02, auth, R-02 |
