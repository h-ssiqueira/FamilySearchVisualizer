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
- Login = Google sign-in, then FamilySearch OAuth2 authorization code + PKCE. Intent: the login authenticates the user so the app can retrieve data through the APIs (see the technical caveat in [auth](5-security/1-auth-authorization.md), OQ-01).
- V1 ancestor depth is **unlimited**: loaded incrementally, generation by generation, always cancellable (ADR-09).
- First-version views: V1 direct line, V2 + siblings/children of each couple, V3 + spouses of those children and their children (see [objective](1-overview/2-objective.md)).

## Open questions
| ID | Question | Affects |
|----|----------|---------|
| OQ-01 | Author's intent: Google login authenticates the user so the app can call the APIs. Caveat: FamilySearch's API accepts only a FamilySearch token, not a Google credential. Is Google (a) just one way to sign in on FamilySearch's own login page, so the app needs only the FamilySearch flow, or (b) a separate sign-in in the app that only identifies the visitor? | 5-security, FR-01, ADR-03 |
| OQ-02 | ~~Maximum generations~~ **Resolved: unlimited.** Remaining: how many generations to auto-load before asking the user to continue (proposed: 4)? | FR-12, ADR-09 |
| OQ-03 | Confirm V2 and V3 interpretation (see objective, section "Views"). | FR-13, FR-14 |
| OQ-04 | People can have several parent sets (biological, adoptive, step) and several spouses. Show only the first/preferred, or let the user switch? | FR-19, data model |
| OQ-05 | Do all cards need dates/places (one request per person) or can cards show name only until selected? | NFR-02, flows |
| OQ-06 | The person-details endpoint (`service/tree/tree-data/v8/...`) looks like the website's internal API. Is there an agreement/permission, or should it be replaced by the documented `api.familysearch.org` API? | R-01 |
| OQ-07 | Is a FamilySearch developer key already registered? Redirect URIs (GitHub Pages URL, localhost) must be pre-registered with FamilySearch. | 5-security, 7-operations |
| OQ-08 | UI languages (en only, or pt-BR as well)? | NFR-08 |
| OQ-09 | `3-interfaces.md` and `8-attachments/examples.md` look like raw API samples. If they contain real people (especially living ones) they should be anonymized before being public. | NFR-05 |
| OQ-10 | Placement of parents in the binary tree (father left / mother right, or `parent1` left)? | data model, FR-11 |
| OQ-11 | Is client-side error reporting (e.g. Sentry) acceptable, or zero telemetry? | 7-operations |
| OQ-12 | Final URL (user page, project page, custom domain)? | 7-operations, OAuth redirect |
