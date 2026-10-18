# Software Design Document – FamilySearch Visualizer

Read-only, client-side web app that shows a FamilySearch family tree in progressively richer views, starting from the signed-in user.

## Index
| # | Section | Files |
|---|---------|-------|
| 1 | Overview | [context](1-overview/1-context.md), [objective](1-overview/2-objective.md) |
| 2 | Requirements | [functional](2-requirements/1-functional.md), [non-functional](2-requirements/2-non-functional.md) |
| 3 | Architecture | [vision](3-architecture/1-arch-vision.md), [diagrams](3-architecture/2-diagrams.md), [technologies](3-architecture/3-technologies.md) |
| 4 | Design | [data model](4-design/1-data-model.md), [modules](4-design/2-module-design.md), [interfaces](4-design/3-interfaces.md), [flows](4-design/4-flows.md) |
| 5 | Security | [auth](5-security/1-auth-authorization.md), [controls](5-security/2-security-controls.md) |
| 6 | Tests | [strategy](6-tests/1-strategy.md), [test cases](6-tests/2-test-cases.md) |
| 7 | Operations | [deploy](7-operations/1-deploy.md), [monitoring](7-operations/2-monitoring.md), [backup & recovery](7-operations/3-backup-recovery.md) |
| 8 | Attachments | [examples](8-attachments/examples.md), [glossary](8-attachments/glossary.md) |

## Conventions
- IDs: `FR-xx` functional, `NFR-xx` non-functional, `ADR-xx` decisions, `TC-xx` test cases, `OQ-xx` open questions, `R-xx` risks.
- Status tags: **Decided** (confirmed by the author), **Proposed** (drafted, needs confirmation), **Assumption** (inferred, verify).

## Decisions confirmed so far
- Pure client-side SPA hosted on GitHub Pages (no backend).
- Login: the user signs in on **FamilySearch's own login page** (OAuth2 authorization code + PKCE). Google is one of the sign-in methods offered *there*; the app has no separate Google sign-in, no Google client and no Google SDK (OQ-01 resolved).
- V1 ancestor depth is **unlimited**: loaded incrementally, generation by generation, always cancellable (ADR-09).
- Views confirmed (OQ-03 resolved): V1 direct line; V2 = V1 + all children of every couple shown; V3 = V2 + the spouses of those children and their children, one level only (see [objective](1-overview/2-objective.md)).
- No FamilySearch developer key exists yet (OQ-07): getting one is the first project milestone.
- The sample files contain real personal data and must be sanitized (OQ-09 confirmed, action A3).

## Action items
| ID | Action | Why |
|----|--------|-----|
| A1 | Create a FamilySearch developer account and an integration (sandbox) app; register redirect URIs (localhost, GitHub Pages) | No key = no login, no API calls |
| A2 | Run the spike in [arch vision](3-architecture/1-arch-vision.md) (PKCE from a browser, CORS, token lifetime, one ancestry call) | Confirms ADR-01 is viable |
| A3 | Remove or anonymize real data in `4-design/3-interfaces.md` and `8-attachments/examples.md`; if it was ever on a public branch, treat it as exposed and rewrite history or ask GitHub to purge caches | Privacy of (possibly living) people |
| A4 | Ask FamilySearch developer support: public (secret-less) browser client? CORS? production review for a personal project? | Unknowns that decide the architecture |
| A5 | Decide OQ-06 (documented API) before building the tree builder | Avoids rework and key suspension |

## Open questions
| ID | Question | Affects |
|----|----------|---------|
| OQ-01 | ~~Google login mechanism~~ **Resolved:** Google is used on FamilySearch's login page; the app never talks to Google. Note: the URL `https://ident.familysearch.org/oauth2/authorization/google` could not be opened (the site blocks automated access) and it is not part of the documented flow, so the app should start from the documented authorization endpoint and let the user choose Google there. | 5-security |
| OQ-02 | ~~Maximum generations~~ **Resolved: unlimited.** Remaining: how many generations to auto-load before asking the user to continue (proposed: 4)? | FR-12, ADR-09 |
| OQ-03 | ~~V2/V3 interpretation~~ **Resolved: confirmed.** | FR-13, FR-14 |
| OQ-04 | People can have several parent sets (biological, adoptive, step) and several spouses. Show only the first/preferred, or let the user switch? | FR-19, data model |
| OQ-05 | Do all cards need dates/places or can cards show name only until selected? | NFR-02, flows |
| OQ-06 | **Critical.** FamilySearch's compatibility rules say an app using undocumented APIs is not listed and its app key is disabled. `service/tree/tree-data/v8/...` is not documented. Proposal (ADR-10): use the documented `api.familysearch.org/platform/tree/ancestry` and `descendancy` endpoints (several generations per call). Adopt? | R-01, data model, module design |
| OQ-07 | **No developer key yet.** Integration (sandbox) key comes with a developer account; beta and production require the compatibility review. Until then the app can show test data only. Accept? | R-04, roadmap |
| OQ-08 | UI languages (en only, or pt-BR as well)? | NFR-08 |
| OQ-09 | ~~Do the samples contain real people?~~ **Yes** (author's answer). See action A3. | NFR-05, R-05 |
| OQ-10 | Placement of parents in the binary tree (father left / mother right, or `parent1` left)? If ADR-10 is adopted, ahnen numbering (father = even, mother = odd) answers this. | data model, FR-11 |
| OQ-11 | Is client-side error reporting (e.g. Sentry) acceptable, or zero telemetry? | 7-operations |
| OQ-12 | Final URL (user page, project page, custom domain)? | 7-operations, OAuth redirect |
| OQ-13 | Production review requires signed agreements and a security assessment. Is that acceptable for a personal project, or is v1 limited to sandbox/beta data? Who signs (person or organization)? | roadmap, R-04 |
| OQ-14 | Newer FamilySearch developer pages mention a client ID **and client secret**. A browser app cannot keep a secret: does a public (PKCE-only) client type exist? | ADR-02, A4 |
