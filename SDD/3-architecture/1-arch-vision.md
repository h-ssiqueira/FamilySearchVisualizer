# Architecture vision

## 1. Style
A **client-only single-page application** (SPA) delivered as static files from GitHub Pages. The browser talks directly to FamilySearch (login, token and API). There is no server we operate.

## 2. Principles
1. **Read-only and stateless**: the source of truth is always FamilySearch.
2. **Lazy by default**: fetch only what the current view needs; hydrate details on demand.
3. **One door to the outside**: every FamilySearch call passes through a single API client (auth header, throttling, retry, validation, mapping).
4. **Pure domain core**: tree building and layout have no React or network dependency, so they are unit-testable.
5. **Privacy by default**: no telemetry, no persistence of family data beyond the tab session.

## 3. Layers
```
UI (React components, views V1/V2/V3)
   ↓
View models & layout (tree building, positions)
   ↓
Domain (Person, Couple, Event, Place + rules)
   ↓
Data access (FamilySearch client, cache, throttling)   Auth (FamilySearch PKCE)
```
Dependencies point downward only. Details in [module design](../4-design/2-module-design.md).

## 4. Architecture decisions
| ID | Decision | Status | Rationale / consequences |
|----|----------|--------|--------------------------|
| ADR-01 | Pure client-side SPA on GitHub Pages | Decided | Zero hosting cost; but no secret storage, no CORS proxy, no server-side headers. |
| ADR-02 | FamilySearch OAuth2 authorization code + PKCE | Decided | Standard for public clients; `client_id` and redirect URIs are build-time configuration. |
| ADR-03 | Google is used only as a sign-in method on FamilySearch's own login page; the app has no Google client or SDK | Decided | A Google credential cannot authorize FamilySearch API calls; only the FamilySearch token can. One login flow, one token, nothing extra to configure or secure. |
| ADR-04 | Two node weights: *light* (id, name, gender from a relative's response) and *full* (details response) | Proposed | Lets V2 render with no extra calls and bounds V3 cost. |
| ADR-05 | Request pipeline with bounded concurrency, `Retry-After` handling and in-memory cache | Proposed | FamilySearch throttles per user by processing time. |
| ADR-06 | Hash-based routing (`/#/...`) | Proposed | GitHub Pages has no SPA fallback; deep links/refresh keep working. |
| ADR-07 | Tokens kept in memory; `sessionStorage` only for the PKCE verifier/state during the redirect | Proposed | Limits exposure on XSS; user re-logs in after closing the tab. |
| ADR-08 | Runtime validation (schema) of every API response | Proposed | Detects API drift; important because one endpoint appears internal (R-01). |
| ADR-09 | Unlimited ancestor depth via incremental, cancellable, generation-by-generation loading | Decided (unlimited) / Proposed (mechanics) | Never block the UI; user controls how far to go; needs virtualized rendering and a visible progress/stop control. |
| ADR-10 | Use only documented FamilySearch endpoints: `platform/tree/ancestry`, `platform/tree/descendancy` and the documented person/relationship resources, instead of the internal `tree-data/v8` endpoint | Proposed (OQ-06) | The internal endpoint is undocumented and may change without notice. The ancestry query returns several generations per call (the guide states a maximum of 9), which also removes most of the one-request-per-person cost. Trade-off: different payload format (GEDCOM X); the mapping layer (ADR-08) absorbs it. |

## 5. Risks
| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R-01 | `service/tree/tree-data/v8/...` is not a documented API: it may change or stop working without notice. | High | Isolate all endpoints behind the API client; contract tests; consider ADR-10 (OQ-06). |
| R-02 | CORS from `*.github.io` to FamilySearch may be blocked for some endpoints. | High | Early technical spike (see section 6); if blocked, ADR-01 must be revisited (e.g. serverless proxy). |
| R-03 | Throttling (429) and slow loads on large trees, now that depth is unlimited. | Medium | Lazy loading, bounded concurrency, auto-load only a first batch, user-driven continuation, `Retry-After`, cancellation. |
| R-04 | ~~Developer key / registration~~ Dropped: out of scope (author's decision). | – | – |
| R-05 | Personal data of living people exposed via samples in the public repo. | High | Anonymize fixtures (OQ-09). |
| R-06 | Pedigree collapse (same ancestor reached twice) breaks a strict binary tree. | Low | Node identity by person id; render duplicates with a "see above" marker. |

## 6. Suggested first spike (before building views)
1. Configure the OAuth `client_id` and the redirect URIs (localhost and GitHub Pages).
2. From a bare page on `github.io`, complete PKCE login and call `users/current` and one documented `ancestry` request. Confirms CORS, token lifetime and response shape end to end.
